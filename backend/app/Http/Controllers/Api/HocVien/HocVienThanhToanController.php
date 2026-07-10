<?php

namespace App\Http\Controllers\Api\HocVien;

use App\Http\Controllers\Controller;
use App\Models\GoiHoc;
use App\Models\LichHoc;
use App\Models\ThanhToan;
use App\Models\ThongBao;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\Rule;

class HocVienThanhToanController extends Controller
{
    public function lichSuThanhToan(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->vai_tro !== 'hocvien') {
            return response()->json([
                'success' => false,
                'message' => 'Chuc nang nay chi danh cho tai khoan hoc vien.',
            ], 403);
        }

        $danhSach = ThanhToan::query()
            ->with([
                'goiHoc:id,hocvien_id,giasu_id,monhoc_id,loai_goi_id,tong_tien,trang_thai',
                'goiHoc.giasu:id,user_id',
                'goiHoc.giasu.user:id,ho_ten',
                'goiHoc.monHoc:id,ten_mon,lop,cap_hoc_id',
                'goiHoc.loaiGoi:id,ten_loai_goi',
            ])
            ->whereHas('goiHoc', fn ($query) => $query->where('hocvien_id', $user->id))
            ->orderByDesc(DB::raw('COALESCE(ngay_thanhtoan, created_at)'))
            ->get()
            ->map(fn (ThanhToan $thanhToan) => $this->dinhDangLichSuThanhToan($thanhToan))
            ->values();

        return response()->json([
            'success' => true,
            'data' => $danhSach,
        ]);
    }

    public function thanhToanGoiHoc(Request $request, int $goiHocId): JsonResponse
    {
        $user = $request->user();

        if ($user->vai_tro !== 'hocvien') {
            return response()->json([
                'success' => false,
                'message' => 'Chuc nang thanh toan chi danh cho tai khoan hoc vien.',
            ], 403);
        }

        $duLieu = $request->validate([
            'phuong_thuc' => ['required', Rule::in(['tienmat', 'momo', 'zalopay', 'banking'])],
            'ma_giaodich' => ['nullable', 'string', 'max:255'],
            'noi_dung_thanhtoan' => ['nullable', 'string', 'max:1000'],
            'anh_minh_chung' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ], [
            'anh_minh_chung.required' => 'Vui lòng chọn ảnh minh chứng thanh toán.',
            'anh_minh_chung.image' => 'Ảnh minh chứng thanh toán không hợp lệ.',
            'anh_minh_chung.mimes' => 'Ảnh minh chứng chỉ hỗ trợ JPG, JPEG, PNG hoặc WEBP.',
            'anh_minh_chung.max' => 'Ảnh minh chứng không được lớn hơn 4MB.',
            'anh_minh_chung.uploaded' => 'Tải ảnh minh chứng thất bại. Vui lòng chọn ảnh nhỏ hơn 2MB hoặc thử ảnh khác.',
        ]);

        $goiHoc = GoiHoc::query()
            ->with(['hocVien:id,ho_ten', 'giasu.user:id,ho_ten', 'monHoc:id,ten_mon,lop,cap_hoc_id', 'lichHocs', 'thanhToanMoiNhat'])
            ->where('hocvien_id', $user->id)
            ->where('trang_thai', 'cho_thanhtoan')
            ->find($goiHocId);

        if (! $goiHoc) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay goi hoc dang cho thanh toan.',
            ], 404);
        }

        if ($this->laGoiHocThu($goiHoc) || (float) $goiHoc->tong_tien <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Gói học miễn phí hoặc học thử không cần gửi minh chứng thanh toán.',
            ], 422);
        }

        if ($goiHoc->thanhToanMoiNhat?->trang_thai === 'cho_thanhtoan') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn đã gửi minh chứng thanh toán. Vui lòng chờ admin xác nhận.',
            ], 422);
        }

        $duongDanMinhChung = $this->luuAnhMinhChungThanhToan($request);
        $maGiaoDich = filled($duLieu['ma_giaodich'] ?? null)
            ? trim($duLieu['ma_giaodich'])
            : 'GD' . now()->format('YmdHis') . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT);

        $goiHocMoi = DB::transaction(function () use ($goiHoc, $duLieu, $user, $duongDanMinhChung, $maGiaoDich) {
            ThanhToan::create([
                'goihoc_id' => $goiHoc->id,
                'so_tien' => $goiHoc->tong_tien,
                'phuong_thuc' => $duLieu['phuong_thuc'],
                'ma_giaodich' => $maGiaoDich,
                'noi_dung_thanhtoan' => filled($duLieu['noi_dung_thanhtoan'] ?? null)
                    ? trim($duLieu['noi_dung_thanhtoan'])
                    : 'Học viên gửi minh chứng thanh toán gói học.',
                'anh_minh_chung' => $duongDanMinhChung,
                'ngay_thanhtoan' => now(),
                'trang_thai' => 'cho_thanhtoan',
            ]);

            User::query()
                ->where('vai_tro', 'admin')
                ->get(['id'])
                ->each(fn (User $admin) => ThongBao::create([
                    'user_id' => $admin->id,
                    'tieu_de' => 'Học viên gửi minh chứng thanh toán',
                    'noi_dung' => "{$user->ho_ten} đã gửi minh chứng thanh toán gói học GH" . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT) . '. Vui lòng kiểm tra và xác nhận.',
                    'url' => '/admin/quan-ly-dat-goi#xac_nhan_thanh_toan',
                    'da_doc' => false,
                ]));

            return $goiHoc->fresh(['monHoc:id,ten_mon,lop,cap_hoc_id', 'giasu.user:id,ho_ten', 'lichHocs', 'thanhToanMoiNhat']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Đã gửi minh chứng thanh toán. Vui lòng chờ admin xác nhận.',
            'data' => $this->dinhDangGoiHocChoHocVien($goiHocMoi),
        ]);
    }

    private function dinhDangGoiHocChoHocVien(GoiHoc $goiHoc): array
    {
        $trangThai = [
            'cho_xacnhan' => 'cho_xacnhan',
            'cho_thanhtoan' => 'cho_thanhtoan',
            'danghoc' => 'dang_hoc',
            'hoanthanh' => 'hoan_thanh',
            'dahuy' => 'da_huy',
        ][$goiHoc->trang_thai] ?? $goiHoc->trang_thai;

        return [
            'id' => $goiHoc->id,
            'ma' => 'GH' . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT),
            'mon' => $goiHoc->monHoc?->ten_mon ?? 'Mon hoc',
            'lop' => $goiHoc->monHoc?->lop,
            'loaiGoi' => $this->nhanLoaiGoi($goiHoc),
            'hocDinhKy' => $this->laGoiDinhKy($goiHoc),
            'giaSu' => $goiHoc->giasu?->user?->ho_ten ?? 'Gia su',
            'ngayBatDau' => $goiHoc->ngay_batdau,
            'ngayKetThuc' => $goiHoc->ngay_ketthuc,
            'soBuoi' => $goiHoc->so_buoi,
            'soBuoiDaLenLich' => $goiHoc->lichHocs->count(),
            'hinhThuc' => $goiHoc->hinh_thuc_hoc === 'online' ? 'Online' : 'Tai nha',
            'diaDiem' => $goiHoc->dia_chi_hoc ?: ($goiHoc->hinh_thuc_hoc === 'online' ? 'Online' : 'Chua cap nhat'),
            'tongTien' => (float) $goiHoc->tong_tien,
            'trangThai' => $trangThai,
            'coTheHuy' => $goiHoc->trang_thai === 'cho_xacnhan',
            'coTheThanhToan' => $goiHoc->trang_thai === 'cho_thanhtoan'
                && ! $this->laGoiHocThu($goiHoc)
                && (float) $goiHoc->tong_tien > 0
                && ! in_array($goiHoc->thanhToanMoiNhat?->trang_thai, ['cho_thanhtoan', 'da_thanhtoan'], true),
            'thanhToan' => $goiHoc->thanhToanMoiNhat ? $this->dinhDangThanhToan($goiHoc->thanhToanMoiNhat) : null,
            'lichHoc' => $goiHoc->lichHocs
                ->map(fn (LichHoc $lichHoc) => [
                    'id' => $lichHoc->id,
                    'ma' => 'LH' . str_pad((string) $lichHoc->id, 6, '0', STR_PAD_LEFT),
                    'ngayHoc' => Carbon::parse($lichHoc->ngay_hoc)->toDateString(),
                    'gioBatDau' => substr((string) $lichHoc->gio_batdau, 0, 5),
                    'gioKetThuc' => substr((string) $lichHoc->gio_ketthuc, 0, 5),
                    'trangThai' => $lichHoc->trang_thai,
                ])
                ->values(),
        ];
    }

    private function luuAnhMinhChungThanhToan(Request $request): string
    {
        $thuMucAnh = public_path('images/minh-chung-thanh-toan');

        if (! File::exists($thuMucAnh)) {
            File::makeDirectory($thuMucAnh, 0755, true);
        }

        $file = $request->file('anh_minh_chung');
        $tenFile = 'minh-chung-' . $request->user()->id . '-' . time() . '-' . bin2hex(random_bytes(4))
            . '.' . $file->getClientOriginalExtension();

        $file->move($thuMucAnh, $tenFile);

        return 'images/minh-chung-thanh-toan/' . $tenFile;
    }

    private function nhanLoaiGoi(GoiHoc $goiHoc): string
    {
        return match ($this->kieuGoiHoc($goiHoc)) {
            'dinh_ky' => 'Gói học định kỳ',
            'hoc_thu' => 'Gói học thử',
            default => 'Gói học không định kỳ',
        };
    }

    private function laGoiDinhKy(GoiHoc $goiHoc): bool
    {
        return $this->kieuGoiHoc($goiHoc) === 'dinh_ky';
    }

    private function laGoiHocThu(GoiHoc $goiHoc): bool
    {
        return $this->kieuGoiHoc($goiHoc) === 'hoc_thu';
    }

    private function kieuGoiHoc(GoiHoc $goiHoc): string
    {
        if (in_array($goiHoc->kieu_goi, ['hoc_thu', 'dinh_ky', 'khong_dinh_ky'], true)) {
            return $goiHoc->kieu_goi;
        }

        if ($goiHoc->hoc_dinhky) {
            return 'dinh_ky';
        }

        return (int) $goiHoc->so_buoi === 1 ? 'hoc_thu' : 'khong_dinh_ky';
    }

    private function dinhDangThanhToan(ThanhToan $thanhToan): array
    {
        return [
            'id' => $thanhToan->id,
            'soTien' => number_format((float) $thanhToan->so_tien, 0, ',', '.') . 'd',
            'phuongThuc' => $this->dinhDangPhuongThucThanhToan($thanhToan->phuong_thuc),
            'soTaiKhoan' => $thanhToan->so_tai_khoan,
            'maGiaoDich' => $thanhToan->ma_giaodich,
            'noiDung' => $thanhToan->noi_dung_thanhtoan,
            'anhMinhChung' => $thanhToan->anh_minh_chung,
            'ngayThanhToan' => $thanhToan->ngay_thanhtoan?->format('d/m/Y H:i') ?? '',
            'trangThai' => $thanhToan->trang_thai,
        ];
    }

    private function dinhDangLichSuThanhToan(ThanhToan $thanhToan): array
    {
        $goiHoc = $thanhToan->goiHoc;
        $monHoc = $goiHoc?->monHoc;

        return [
            'id' => $thanhToan->id,
            'maGoi' => $goiHoc ? 'GH' . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT) : 'Chưa cập nhật',
            'soTien' => (float) $thanhToan->so_tien,
            'soTienText' => number_format((float) $thanhToan->so_tien, 0, ',', '.') . 'đ',
            'phuongThuc' => $this->dinhDangPhuongThucThanhToan($thanhToan->phuong_thuc),
            'maGiaoDich' => $thanhToan->ma_giaodich,
            'noiDung' => $thanhToan->noi_dung_thanhtoan,
            'anhMinhChung' => $thanhToan->anh_minh_chung,
            'ngayThanhToan' => $thanhToan->ngay_thanhtoan?->format('d/m/Y H:i') ?? '',
            'trangThai' => $thanhToan->trang_thai,
            'trangThaiText' => $this->tenTrangThaiThanhToan($thanhToan->trang_thai),
            'goiHoc' => [
                'monHoc' => $monHoc
                    ? trim($monHoc->ten_mon . ($monHoc->lop ? ' - ' . $this->dinhDangLop($monHoc->lop) : ''))
                    : 'Môn học',
                'loaiGoi' => $goiHoc?->loaiGoi?->ten_loai_goi,
                'giaSu' => $goiHoc?->giasu?->user?->ho_ten ?? 'Gia sư',
                'trangThai' => $goiHoc?->trang_thai,
            ],
        ];
    }

    private function dinhDangLop(?string $lop): string
    {
        $lop = trim((string) $lop);

        if ($lop === '') {
            return '';
        }

        return str_starts_with(mb_strtolower($lop, 'UTF-8'), 'lớp') ? $lop : 'Lớp ' . $lop;
    }

    private function tenTrangThaiThanhToan(?string $trangThai): string
    {
        return [
            'cho_thanhtoan' => 'Chờ duyệt',
            'da_thanhtoan' => 'Đã thanh toán',
            'that_bai' => 'Thất bại',
        ][$trangThai] ?? 'Chưa cập nhật';
    }

    private function dinhDangPhuongThucThanhToan(?string $phuongThuc): string
    {
        return [
            'tienmat' => 'Tiền mặt',
            'momo' => 'Momo',
            'zalopay' => 'ZaloPay',
            'banking' => 'Chuyển khoản',
        ][$phuongThuc] ?? 'Chưa cập nhật';
    }
}

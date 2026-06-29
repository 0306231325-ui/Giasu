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
use Illuminate\Validation\Rule;

class HocVienThanhToanController extends Controller
{
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
            ->with(['hocVien:id,ho_ten', 'giasu.user:id,ho_ten', 'monHoc:id,ten_mon,lop', 'lichHocs', 'thanhToanMoiNhat'])
            ->where('hocvien_id', $user->id)
            ->where('trang_thai', 'cho_thanhtoan')
            ->find($goiHocId);

        if (! $goiHoc) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay goi hoc dang cho thanh toan.',
            ], 404);
        }

        if ($goiHoc->thanhToanMoiNhat?->trang_thai === 'cho_thanhtoan') {
            return response()->json([
                'success' => false,
                'message' => 'Ban da gui minh chung thanh toan. Vui long cho admin xac nhan.',
            ], 422);
        }

        $duongDanMinhChung = $request->file('anh_minh_chung')->store('images/minh-chung-thanh-toan', 'public');
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
                    : 'Hoc vien gui minh chung thanh toan goi hoc.',
                'anh_minh_chung' => '/storage/' . $duongDanMinhChung,
                'ngay_thanhtoan' => now(),
                'trang_thai' => 'cho_thanhtoan',
            ]);

            User::query()
                ->where('vai_tro', 'admin')
                ->get(['id'])
                ->each(fn (User $admin) => ThongBao::create([
                    'user_id' => $admin->id,
                    'tieu_de' => 'Hoc vien gui minh chung thanh toan',
                    'noi_dung' => "{$user->ho_ten} da gui minh chung thanh toan goi hoc GH" . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT) . '. Vui long kiem tra va xac nhan.',
                    'url' => '/admin/quan-ly-dat-goi',
                    'da_doc' => false,
                ]));

            return $goiHoc->fresh(['monHoc:id,ten_mon,lop', 'giasu.user:id,ho_ten', 'lichHocs', 'thanhToanMoiNhat']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Da gui minh chung thanh toan. Vui long cho admin xac nhan.',
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

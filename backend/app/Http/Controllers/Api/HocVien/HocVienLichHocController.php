<?php

namespace App\Http\Controllers\Api\HocVien;

use App\Http\Controllers\Controller;
use App\Models\DanhGia;
use App\Models\GoiHoc;
use App\Models\LichHoc;
use App\Models\ThanhToan;
use App\Models\ThongBao;
use App\Models\YeuCauHocBu;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HocVienLichHocController extends Controller
{
    public function lichHocCuaToi(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->vai_tro !== 'hocvien') {
            return response()->json([
                'success' => false,
                'message' => 'Khu vuc nay chi danh cho tai khoan hoc vien.',
            ], 403);
        }

        $danhSach = GoiHoc::query()
            ->with([
                'monHoc:id,ten_mon,lop',
                'giasu.user:id,ho_ten',
                'lichHocs' => fn ($query) => $query
                    ->with(['danhGia', 'yeuCauHocBus' => fn ($yeuCau) => $yeuCau->latest()])
                    ->orderBy('ngay_hoc')
                    ->orderBy('gio_batdau'),
                'thanhToanMoiNhat',
            ])
            ->where('hocvien_id', $user->id)
            ->latest()
            ->get()
            ->map(fn (GoiHoc $goiHoc) => $this->dinhDangGoiHocChoHocVien($goiHoc))
            ->values();

        return response()->json([
            'success' => true,
            'data' => $danhSach,
        ]);
    }

    public function danhGiaBuoiHoc(Request $request, int $lichHocId): JsonResponse
    {
        $user = $request->user();

        if ($user->vai_tro !== 'hocvien') {
            return response()->json([
                'success' => false,
                'message' => 'Chuc nang danh gia chi danh cho tai khoan hoc vien.',
            ], 403);
        }

        $duLieu = $request->validate([
            'so_sao' => ['required', 'integer', 'min:1', 'max:5'],
            'noi_dung' => ['nullable', 'string', 'max:1000'],
        ]);

        $lichHoc = LichHoc::query()
            ->with(['goiHoc', 'danhGia'])
            ->whereHas('goiHoc', fn ($query) => $query->where('hocvien_id', $user->id))
            ->find($lichHocId);

        if (! $lichHoc) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay buoi hoc cua ban.',
            ], 404);
        }

        if ($lichHoc->trang_thai !== 'hoanthanh') {
            return response()->json([
                'success' => false,
                'message' => 'Chi co the danh gia sau khi buoi hoc hoan thanh.',
            ], 422);
        }

        $danhGia = DanhGia::query()->updateOrCreate(
            ['lichhoc_id' => $lichHoc->id],
            [
                'user_id' => $user->id,
                'so_sao' => $duLieu['so_sao'],
                'noi_dung' => filled($duLieu['noi_dung'] ?? null) ? trim($duLieu['noi_dung']) : null,
            ],
        );

        if ($lichHoc->giasu?->user_id) {
            ThongBao::create([
                'user_id' => $lichHoc->giasu->user_id,
                'tieu_de' => 'Hoc vien da danh gia buoi hoc',
                'noi_dung' => "{$user->ho_ten} da danh gia {$duLieu['so_sao']} sao cho buoi hoc.",
                'url' => '/gia-su/quan-ly/theo-doi-hoat-dong',
                'da_doc' => false,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Da luu danh gia buoi hoc.',
            'data' => $this->dinhDangDanhGia($danhGia),
        ]);
    }

    public function yeuCauDoiBuoiHoc(Request $request, int $lichHocId): JsonResponse
    {
        $user = $request->user();

        if ($user->vai_tro !== 'hocvien') {
            return response()->json([
                'success' => false,
                'message' => 'Chuc nang doi buoi chi danh cho tai khoan hoc vien.',
            ], 403);
        }

        $duLieu = $request->validate([
            'ngay_hoc' => ['required', 'date', 'after_or_equal:today'],
            'gio_batdau' => ['required', 'date_format:H:i'],
            'gio_ketthuc' => ['required', 'date_format:H:i', 'after:gio_batdau'],
            'ly_do' => ['required', 'string', 'max:1000'],
        ]);

        $lichHoc = LichHoc::query()
            ->with(['goiHoc', 'yeuCauHocBus'])
            ->whereHas('goiHoc', fn ($query) => $query->where('hocvien_id', $user->id))
            ->whereIn('trang_thai', ['cho_xacnhan', 'da_nhan'])
            ->find($lichHocId);

        if (! $lichHoc) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay buoi hoc co the yeu cau doi.',
            ], 404);
        }

        $yeuCauDangCho = $lichHoc->yeuCauHocBus()
            ->where('trang_thai', 'cho_duyet')
            ->exists();

        if ($yeuCauDangCho) {
            return response()->json([
                'success' => false,
                'message' => 'Buoi hoc nay dang co yeu cau doi lich cho duyet.',
            ], 422);
        }

        $yeuCau = YeuCauHocBu::create([
            'lichhoc_goc_id' => $lichHoc->id,
            'giasu_id' => $lichHoc->giasu_id,
            'nguoi_yeu_cau_id' => $user->id,
            'ngay_yeu_cau' => now(),
            'ngay_hoc' => $duLieu['ngay_hoc'],
            'gio_batdau' => $duLieu['gio_batdau'],
            'gio_ketthuc' => $duLieu['gio_ketthuc'],
            'ly_do' => trim($duLieu['ly_do']),
            'trang_thai' => 'cho_duyet',
        ]);

        if ($lichHoc->giasu?->user_id) {
            ThongBao::create([
                'user_id' => $lichHoc->giasu->user_id,
                'tieu_de' => 'Hoc vien yeu cau doi buoi hoc',
                'noi_dung' => "{$user->ho_ten} muon doi buoi hoc sang {$duLieu['ngay_hoc']} {$duLieu['gio_batdau']} - {$duLieu['gio_ketthuc']}.",
                'url' => '/gia-su/quan-ly/lich-day',
                'da_doc' => false,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Da gui yeu cau doi buoi hoc. Vui long cho gia su/admin duyet.',
            'data' => $this->dinhDangYeuCauHocBu($yeuCau),
        ], 201);
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
                ->map(fn (LichHoc $lichHoc) => $this->dinhDangLichHoc($lichHoc))
                ->values(),
        ];
    }

    private function dinhDangLichHoc(LichHoc $lichHoc): array
    {
        $ngayHoc = Carbon::parse($lichHoc->ngay_hoc);
        $yeuCauHocBuMoiNhat = $lichHoc->relationLoaded('yeuCauHocBus')
            ? $lichHoc->yeuCauHocBus->sortByDesc('created_at')->first()
            : null;
        $trangThai = [
            'cho_xacnhan' => 'cho_xacnhan',
            'da_nhan' => 'da_nhan',
            'hoanthanh' => 'hoan_thanh',
            'dahuy' => 'da_huy',
        ][$lichHoc->trang_thai] ?? $lichHoc->trang_thai;

        return [
            'id' => $lichHoc->id,
            'ma' => 'LH' . str_pad((string) $lichHoc->id, 6, '0', STR_PAD_LEFT),
            'mon' => $lichHoc->goiHoc?->monHoc?->ten_mon ?? 'Mon hoc',
            'giaSu' => $lichHoc->giasu?->user?->ho_ten ?? 'Gia su',
            'ngayHoc' => $ngayHoc->toDateString(),
            'thu' => $this->tenThu($ngayHoc->isoWeekday()),
            'gioBatDau' => substr((string) $lichHoc->gio_batdau, 0, 5),
            'gioKetThuc' => substr((string) $lichHoc->gio_ketthuc, 0, 5),
            'hinhThuc' => $lichHoc->hinh_thuc_hoc === 'online' ? 'Online' : 'Tai nha',
            'diaDiem' => $lichHoc->dia_chi_hoc ?: ($lichHoc->hinh_thuc_hoc === 'online' ? 'Online' : 'Chua cap nhat'),
            'trangThai' => $trangThai,
            'loaiBuoi' => $lichHoc->loai_buoi === 'hoc_bu' ? 'Hoc bu' : 'Hoc thuong',
            'ghiChu' => $lichHoc->ghi_chu,
            'lyDoHuy' => $lichHoc->lydo_huy,
            'coTheDanhGia' => $lichHoc->trang_thai === 'hoanthanh',
            'coTheDoiBuoi' => in_array($lichHoc->trang_thai, ['cho_xacnhan', 'da_nhan'], true)
                && ! ($yeuCauHocBuMoiNhat?->trang_thai === 'cho_duyet'),
            'danhGia' => $lichHoc->danhGia ? $this->dinhDangDanhGia($lichHoc->danhGia) : null,
            'yeuCauDoiBuoi' => $yeuCauHocBuMoiNhat ? $this->dinhDangYeuCauHocBu($yeuCauHocBuMoiNhat) : null,
        ];
    }

    private function dinhDangDanhGia(DanhGia $danhGia): array
    {
        return [
            'id' => $danhGia->id,
            'soSao' => (int) $danhGia->so_sao,
            'noiDung' => $danhGia->noi_dung,
            'ngayDanhGia' => $danhGia->updated_at?->format('d/m/Y H:i') ?? '',
        ];
    }

    private function dinhDangYeuCauHocBu(YeuCauHocBu $yeuCau): array
    {
        return [
            'id' => $yeuCau->id,
            'ngayHoc' => $yeuCau->ngay_hoc?->toDateString(),
            'gioBatDau' => substr((string) $yeuCau->gio_batdau, 0, 5),
            'gioKetThuc' => substr((string) $yeuCau->gio_ketthuc, 0, 5),
            'lyDo' => $yeuCau->ly_do,
            'trangThai' => $yeuCau->trang_thai,
            'ngayYeuCau' => $yeuCau->ngay_yeu_cau?->format('d/m/Y H:i') ?? '',
            'ngayXuLy' => $yeuCau->ngay_xu_ly?->format('d/m/Y H:i') ?? null,
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

    private function tenThu(int $isoWeekday): string
    {
        return [
            1 => 'Thu 2',
            2 => 'Thu 3',
            3 => 'Thu 4',
            4 => 'Thu 5',
            5 => 'Thu 6',
            6 => 'Thu 7',
            7 => 'Chu nhat',
        ][$isoWeekday] ?? '';
    }
}

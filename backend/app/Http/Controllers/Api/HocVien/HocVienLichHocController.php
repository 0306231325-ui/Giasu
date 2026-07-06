<?php

namespace App\Http\Controllers\Api\HocVien;

use App\Http\Controllers\Controller;
use App\Models\DanhGia;
use App\Models\GoiHoc;
use App\Models\LichHoc;
use App\Models\ThanhToan;
use App\Models\ThongBao;
use App\Models\User;
use App\Models\YeuCauHocBu;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HocVienLichHocController extends Controller
{
    private const DAU_HOCVIEN_XACNHAN = 'Hoc vien xac nhan hoan thanh';
    private const DAU_GIASU_XACNHAN = 'Gia su xac nhan hoan thanh';
    private const DAU_HOCVIEN_BAO_VAN_DE = 'Hoc vien bao van de';
    private const DAU_GIASU_BAO_VAN_DE = 'Gia su bao van de';
    private const MUI_GIO_LICH_HOC = 'Asia/Ho_Chi_Minh';

    private function bayGioLichHoc(): Carbon
    {
        return Carbon::now(self::MUI_GIO_LICH_HOC);
    }

    private function thoiDiemLichHoc(LichHoc $lichHoc, string $cotGio): Carbon
    {
        return Carbon::parse($lichHoc->ngay_hoc . ' ' . $lichHoc->{$cotGio}, self::MUI_GIO_LICH_HOC);
    }

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
                'loaiGoi:id,so_thang',
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

        if ($lichHoc->danhGia) {
            return response()->json([
                'success' => false,
                'message' => 'Buoi hoc nay da duoc danh gia. Moi buoi hoc chi duoc danh gia mot lan.',
            ], 422);
        }

        $danhGia = DanhGia::query()->create([
            'lichhoc_id' => $lichHoc->id,
            'user_id' => $user->id,
            'so_sao' => $duLieu['so_sao'],
            'noi_dung' => filled($duLieu['noi_dung'] ?? null) ? trim($duLieu['noi_dung']) : null,
        ]);

        if ($lichHoc->giasu?->user_id) {
            ThongBao::create([
                'user_id' => $lichHoc->giasu->user_id,
                'tieu_de' => 'Học viên đã đánh giá buổi học',
                'noi_dung' => "{$user->ho_ten} đã đánh giá {$duLieu['so_sao']} sao cho buổi học.",
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
            ->whereIn('trang_thai', $this->trangThaiYeuCauDoiBuoiDangXuLy())
            ->exists();

        if ($yeuCauDangCho) {
            return response()->json([
                'success' => false,
                'message' => 'Buoi hoc nay dang co yeu cau doi lich cho duyet.',
            ], 422);
        }

        $duLieu['gio_ketthuc'] = $this->gioKetThucDoiBuoi($duLieu['gio_batdau']);

        $loiTrungLich = $this->kiemTraTrungLichDoiBuoi($lichHoc, $duLieu);
        if ($loiTrungLich) {
            return response()->json([
                'success' => false,
                'message' => $loiTrungLich,
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

        User::query()->where('vai_tro', 'admin')->each(function (User $admin) use ($duLieu, $user) {
            ThongBao::create([
                'user_id' => $admin->id,
                'tieu_de' => 'Học viên yêu cầu đổi buổi học',
                'noi_dung' => "{$user->ho_ten} muốn đổi buổi học sang {$duLieu['ngay_hoc']} {$duLieu['gio_batdau']} - {$duLieu['gio_ketthuc']}.",
                'url' => '/admin/lich-hoc',
                'da_doc' => false,
            ]);
        });

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
        $ngayKetThuc = $this->ngayKetThucHienThi($goiHoc);

        return [
            'id' => $goiHoc->id,
            'ma' => 'GH' . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT),
            'monHocId' => $goiHoc->monhoc_id,
            'mon' => $goiHoc->monHoc?->ten_mon ?? 'Mon hoc',
            'lop' => $goiHoc->monHoc?->lop,
            'loaiGoi' => $this->nhanLoaiGoi($goiHoc),
            'hocDinhKy' => $this->laGoiDinhKy($goiHoc),
            'giaSu' => $goiHoc->giasu?->user?->ho_ten ?? 'Gia su',
            'ngayBatDau' => $goiHoc->ngay_batdau,
            'ngayKetThuc' => $ngayKetThuc,
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

    private function nhanLoaiGoi(GoiHoc $goiHoc): string
    {
        return match ($this->kieuGoiHoc($goiHoc)) {
            'dinh_ky' => 'Gói học định kỳ',
            'hoc_thu' => 'Gói học thử',
            default => 'Gói học không định kỳ',
        };
    }

    private function ngayKetThucHienThi(GoiHoc $goiHoc): ?string
    {
        if (! $goiHoc->ngay_batdau) {
            return $goiHoc->ngay_ketthuc;
        }

        if (! $this->laGoiDinhKy($goiHoc)) {
            return $goiHoc->ngay_ketthuc;
        }

        $soThang = (int) ($goiHoc->loaiGoi?->so_thang ?: 1);

        return Carbon::parse($goiHoc->ngay_batdau)
            ->addDays(max($soThang * 30, 1) - 1)
            ->toDateString();
    }

    private function laGoiDinhKy(GoiHoc $goiHoc): bool
    {
        return $this->kieuGoiHoc($goiHoc) === 'dinh_ky';
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

    private function dinhDangLichHoc(LichHoc $lichHoc): array
    {
        $ngayHoc = Carbon::parse($lichHoc->ngay_hoc);
        $bayGio = $this->bayGioLichHoc();
        $daToiGioBatDau = $bayGio->gte($this->thoiDiemLichHoc($lichHoc, 'gio_batdau'));
        $daQuaGioKetThuc = $bayGio->gte($this->thoiDiemLichHoc($lichHoc, 'gio_ketthuc'));
        $yeuCauHocBuMoiNhat = $lichHoc->relationLoaded('yeuCauHocBus')
            ? $lichHoc->yeuCauHocBus->sortByDesc('created_at')->first()
            : null;
        $trangThai = [
            'cho_xacnhan' => 'cho_xacnhan',
            'da_nhan' => 'da_nhan',
            'hoanthanh' => 'hoan_thanh',
            'dahuy' => 'da_huy',
        ][$lichHoc->trang_thai] ?? $lichHoc->trang_thai;
        $xacNhan = $this->thongTinXacNhanLichHoc($lichHoc);

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
            'daToiGioBatDau' => $daToiGioBatDau,
            'daQuaGioKetThuc' => $daQuaGioKetThuc,
            'coTheXacNhanHoanThanh' => $daToiGioBatDau
                && $lichHoc->trang_thai === 'da_nhan'
                && ! $xacNhan['hocVienDaXacNhan']
                && ! $xacNhan['hocVienBaoVanDe'],
            'xacNhan' => $xacNhan,
            'hocVienXacNhan' => [
                'trangThai' => $xacNhan['hocVienDaXacNhan'] ? 'daxacnhan' : ($xacNhan['hocVienBaoVanDe'] ? 'baovan_de' : null),
                'thoiGian' => null,
                'ghiChu' => $xacNhan['hocVienBaoVanDe'] ? $lichHoc->ghi_chu : null,
            ],
            'giaSuXacNhan' => [
                'trangThai' => $xacNhan['giaSuDaXacNhan'] ? 'daxacnhan' : ($xacNhan['giaSuBaoVanDe'] ? 'baovan_de' : null),
                'thoiGian' => null,
                'ghiChu' => $xacNhan['giaSuBaoVanDe'] ? $lichHoc->ghi_chu : null,
            ],
            'coTheDanhGia' => $lichHoc->trang_thai === 'hoanthanh' && ! $lichHoc->danhGia,
            'coTheDoiBuoi' => in_array($lichHoc->trang_thai, ['cho_xacnhan', 'da_nhan'], true)
                && ! in_array($yeuCauHocBuMoiNhat?->trang_thai, $this->trangThaiYeuCauDoiBuoiDangXuLy(), true),
            'danhGia' => $lichHoc->danhGia ? $this->dinhDangDanhGia($lichHoc->danhGia) : null,
            'yeuCauDoiBuoi' => $yeuCauHocBuMoiNhat ? $this->dinhDangYeuCauHocBu($yeuCauHocBuMoiNhat) : null,
        ];
    }

    private function thongTinXacNhanLichHoc(LichHoc $lichHoc): array
    {
        $ghiChu = (string) $lichHoc->ghi_chu;
        $hocVienDaXacNhan = str_contains($ghiChu, self::DAU_HOCVIEN_XACNHAN);
        $giaSuDaXacNhan = str_contains($ghiChu, self::DAU_GIASU_XACNHAN);
        $hocVienBaoVanDe = str_contains($ghiChu, self::DAU_HOCVIEN_BAO_VAN_DE)
            || str_contains($ghiChu, 'Hoc vien bao van de')
            || str_contains($ghiChu, 'Học viên báo vấn đề');
        $giaSuBaoVanDe = str_contains($ghiChu, self::DAU_GIASU_BAO_VAN_DE);

        return [
            'hocVienDaXacNhan' => $hocVienDaXacNhan,
            'giaSuDaXacNhan' => $giaSuDaXacNhan,
            'hocVienBaoVanDe' => $hocVienBaoVanDe,
            'giaSuBaoVanDe' => $giaSuBaoVanDe,
            'duHaiBenXacNhan' => $hocVienDaXacNhan && $giaSuDaXacNhan,
            'coBaoVanDe' => $hocVienBaoVanDe || $giaSuBaoVanDe,
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
            'ngayHocText' => $yeuCau->ngay_hoc?->format('d/m/Y'),
            'gioBatDau' => substr((string) $yeuCau->gio_batdau, 0, 5),
            'gioKetThuc' => substr((string) $yeuCau->gio_ketthuc, 0, 5),
            'khungGio' => substr((string) $yeuCau->gio_batdau, 0, 5) . ' - ' . substr((string) $yeuCau->gio_ketthuc, 0, 5),
            'lyDo' => $yeuCau->ly_do,
            'trangThai' => $yeuCau->trang_thai,
            'trangThaiText' => $this->tenTrangThaiYeuCauHocBu($yeuCau->trang_thai),
            'lyDoGiaSu' => $yeuCau->ly_do_gia_su,
            'ghiChuAdmin' => $yeuCau->ghi_chu_admin,
            'ngayYeuCau' => $yeuCau->ngay_yeu_cau?->format('d/m/Y H:i') ?? '',
            'ngayXuLy' => $yeuCau->ngay_xu_ly?->format('d/m/Y H:i') ?? null,
            'giaSuPhanHoiLuc' => $yeuCau->gia_su_phan_hoi_luc?->format('d/m/Y H:i') ?? null,
        ];
    }

    private function trangThaiYeuCauDoiBuoiDangXuLy(): array
    {
        return ['cho_duyet', 'cho_gia_su_xac_nhan', 'giasu_dong_y'];
    }

    private function gioKetThucDoiBuoi(string $gioBatDau): string
    {
        return Carbon::createFromFormat('H:i', $gioBatDau)
            ->addMinutes(90)
            ->format('H:i');
    }

    private function kiemTraTrungLichDoiBuoi(LichHoc $lichHoc, array $duLieu): ?string
    {
        $trungGiaSu = LichHoc::query()
            ->where('id', '<>', $lichHoc->id)
            ->where('giasu_id', $lichHoc->giasu_id)
            ->where('trang_thai', '<>', 'dahuy')
            ->whereDate('ngay_hoc', $duLieu['ngay_hoc'])
            ->where('gio_batdau', '<', $duLieu['gio_ketthuc'])
            ->where('gio_ketthuc', '>', $duLieu['gio_batdau'])
            ->exists();

        if ($trungGiaSu) {
            return 'Khung gio moi bi trung lich cua gia su.';
        }

        $hocVienId = $lichHoc->goiHoc?->hocvien_id;
        if (! $hocVienId) {
            return null;
        }

        $trungHocVien = LichHoc::query()
            ->where('id', '<>', $lichHoc->id)
            ->where('trang_thai', '<>', 'dahuy')
            ->whereHas('goiHoc', fn ($query) => $query->where('hocvien_id', $hocVienId))
            ->whereDate('ngay_hoc', $duLieu['ngay_hoc'])
            ->where('gio_batdau', '<', $duLieu['gio_ketthuc'])
            ->where('gio_ketthuc', '>', $duLieu['gio_batdau'])
            ->exists();

        return $trungHocVien ? 'Khung gio moi bi trung lich cua hoc vien.' : null;
    }

    private function tenTrangThaiYeuCauHocBu(?string $trangThai): string
    {
        return [
            'cho_duyet' => 'Chờ admin xử lý',
            'cho_gia_su_xac_nhan' => 'Chờ gia sư xác nhận',
            'giasu_dong_y' => 'Gia sư đồng ý',
            'giasu_tu_choi' => 'Gia sư từ chối',
            'da_duyet' => 'Đã duyệt đổi buổi',
            'tu_choi' => 'Đã từ chối',
        ][$trangThai] ?? 'Chưa cập nhật';
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

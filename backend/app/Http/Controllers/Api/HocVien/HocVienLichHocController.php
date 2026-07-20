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
    private const MUI_GIO_LICH_HOC = 'Asia/Ho_Chi_Minh';

    private function bayGioLichHoc(): Carbon
    {
        return Carbon::now(self::MUI_GIO_LICH_HOC);
    }

    private function thoiDiemLichHoc(LichHoc $lichHoc, string $cotGio): Carbon
    {
        return Carbon::parse($lichHoc->ngay_hoc . ' ' . $lichHoc->{$cotGio}, self::MUI_GIO_LICH_HOC);
    }

    private function daDenNgayHoc(LichHoc $lichHoc): bool
    {
        return $this->bayGioLichHoc()->gte(
            Carbon::parse($lichHoc->ngay_hoc, self::MUI_GIO_LICH_HOC)->startOfDay()
        );
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
                'monHoc:id,ten_mon,lop,cap_hoc_id',
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

        $xacNhan = $this->thongTinXacNhanLichHoc($lichHoc);

        if (! $xacNhan['hocVienDaXacNhan']) {
            return response()->json([
                'success' => false,
                'message' => 'Chi co the danh gia sau khi ban xac nhan hoan thanh buoi hoc.',
            ], 422);
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
            'ly_do' => ['required', 'string', 'max:50'],
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

        if ($this->bayGioLichHoc()->gte($this->thoiDiemLichHoc($lichHoc, 'gio_batdau'))) {
            return response()->json([
                'success' => false,
                'message' => 'Buoi hoc da den gio hoac da qua gio, khong the yeu cau doi lich.',
            ], 422);
        }

        if ($lichHoc->yeuCauHocBus()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Moi buoi hoc chi duoc yeu cau doi lich mot lan.',
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
            'trang_thai' => 'cho_gia_su_xac_nhan',
        ]);

        if ($lichHoc->giasu?->user_id) {
            ThongBao::create([
                'user_id' => $lichHoc->giasu->user_id,
                'tieu_de' => 'Học viên yêu cầu đổi buổi học',
                'noi_dung' => "{$user->ho_ten} muốn đổi buổi học sang {$duLieu['ngay_hoc']} {$duLieu['gio_batdau']} - {$duLieu['gio_ketthuc']}.",
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

    public function thongTinKhoangThoiGianBan(Request $request, int $lichHocId): JsonResponse
    {
        $user = $request->user();

        if ($user->vai_tro !== 'hocvien') {
            return response()->json([
                'success' => false,
                'message' => 'Chuc nang nay chi danh cho tai khoan hoc vien.',
            ], 403);
        }

        $ngayHoc = $request->query('ngay_hoc');
        if (!$ngayHoc) {
            return response()->json(['success' => true, 'data' => []]);
        }

        $lichHoc = LichHoc::query()
            ->with(['goiHoc'])
            ->whereHas('goiHoc', fn ($q) => $q->where('hocvien_id', $user->id))
            ->find($lichHocId);

        if (!$lichHoc) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay buoi hoc.',
            ], 404);
        }

        $hocVienId = $user->id;
        $giaSuId = $lichHoc->giasu_id;

        $lichBan = LichHoc::query()
            ->where('id', '<>', $lichHoc->id)
            ->where('trang_thai', '<>', 'dahuy')
            ->whereDate('ngay_hoc', $ngayHoc)
            ->where(function ($q) use ($giaSuId, $hocVienId) {
                $q->where('giasu_id', $giaSuId)
                  ->orWhereHas('goiHoc', fn ($q2) => $q2->where('hocvien_id', $hocVienId));
            })
            ->get(['gio_batdau', 'gio_ketthuc'])
            ->map(function ($lich) {
                return [
                    'gio_batdau' => substr((string) $lich->gio_batdau, 0, 5),
                    'gio_ketthuc' => substr((string) $lich->gio_ketthuc, 0, 5),
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => $lichBan
        ]);
    }

    public function phanHoiYeuCauHocBuTuGiaSu(Request $request, int $lichHocId): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn chưa đăng nhập.'
            ], 401);
        }

        if ($user->vai_tro !== 'hocvien') {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản không phải học viên.'
            ], 403);
        }

        $hocVienId = $user->id;

        $duLieu = $request->validate([
            'phan_hoi' => 'required|in:dong_y,tu_choi',
        ]);

        $lichHoc = LichHoc::query()
            ->where('id', $lichHocId)
            ->whereHas('goiHoc', fn ($q) => $q->where('hocvien_id', $hocVienId))
            ->first();

        if (! $lichHoc) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy lịch học.'
            ], 404);
        }

        $yeuCau = $lichHoc->yeuCauHocBus()->where('trang_thai', 'cho_hoc_vien_xac_nhan')->first();

        if (! $yeuCau) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy yêu cầu học bù đang chờ xác nhận.'
            ], 404);
        }

        if ($duLieu['phan_hoi'] === 'tu_choi') {
            $yeuCau->update([
                'trang_thai' => 'hoc_vien_tu_choi',
                'nguoi_duyet_id' => $user->id,
                'ngay_xu_ly' => now(),
            ]);

            if ($lichHoc->giasu?->user_id) {
                ThongBao::create([
                    'user_id' => $lichHoc->giasu->user_id,
                    'tieu_de' => 'Học viên từ chối đổi buổi',
                    'noi_dung' => 'Học viên ' . $user->ho_ten . ' đã từ chối yêu cầu đổi buổi học.',
                    'url' => '/gia-su/quan-ly/lich-day',
                    'da_doc' => false,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Đã từ chối yêu cầu đổi buổi.',
            ]);
        }

        // Nếu đồng ý
        $loiTrungLich = $this->kiemTraTrungLichDoiBuoi($lichHoc, [
            'ngay_hoc' => $yeuCau->ngay_hoc,
            'gio_batdau' => $yeuCau->gio_batdau,
            'gio_ketthuc' => $yeuCau->gio_ketthuc,
        ]);

        if ($loiTrungLich) {
            return response()->json([
                'success' => false,
                'message' => $loiTrungLich,
            ], 422);
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($user, $lichHoc, $yeuCau) {
            $ghiChuDoiBuoi = 'Chuyen sang ' . Carbon::parse($yeuCau->ngay_hoc)->format('d/m/Y') . ' '
                . substr((string) $yeuCau->gio_batdau, 0, 5) . ' - ' . substr((string) $yeuCau->gio_ketthuc, 0, 5);
            $trangThaiBuoiMoi = $lichHoc->trang_thai === 'dahuy'
                ? 'dahuy'
                : ($lichHoc->goiHoc && in_array($lichHoc->goiHoc->trang_thai, ['danghoc', 'hoanthanh'], true) ? 'da_nhan' : $lichHoc->trang_thai);

            LichHoc::create([
                'goihoc_id' => $lichHoc->goihoc_id,
                'giasu_id' => $lichHoc->giasu_id,
                'loai_buoi' => $lichHoc->loai_buoi,
                'ngay_hoc' => $yeuCau->ngay_hoc,
                'gio_batdau' => $yeuCau->gio_batdau,
                'gio_ketthuc' => $yeuCau->gio_ketthuc,
                'dia_chi_hoc' => $lichHoc->dia_chi_hoc,
                'hinh_thuc_hoc' => $lichHoc->hinh_thuc_hoc,
                'tien_hoc' => $lichHoc->tien_hoc,
                'phi_hoahong' => $lichHoc->phi_hoahong,
                'tien_giasu_nhan' => $lichHoc->tien_giasu_nhan,
                'trang_thai' => $trangThaiBuoiMoi,
                'ghi_chu' => $this->themDongGhiChu(
                    $lichHoc->ghi_chu,
                    'Hoc vien duyet doi buoi',
                    'Tao buoi moi tu ' . ($lichHoc->ma ?? ('LH' . str_pad((string) $lichHoc->id, 6, '0', STR_PAD_LEFT))),
                ),
            ]);

            $lichHoc->update([
                'trang_thai' => 'dahuy',
                'lydo_huy' => 'Da doi sang buoi moi: ' . $ghiChuDoiBuoi,
                'ghi_chu' => $this->themDongGhiChu(
                    $lichHoc->ghi_chu,
                    'Hoc vien duyet doi buoi',
                    $ghiChuDoiBuoi,
                ),
            ]);

            $yeuCau->update([
                'trang_thai' => 'da_duyet',
                'nguoi_duyet_id' => $user->id,
                'ngay_xu_ly' => now(),
            ]);
        });

        if ($lichHoc->giasu?->user_id) {
            ThongBao::create([
                'user_id' => $lichHoc->giasu->user_id,
                'tieu_de' => 'Học viên đồng ý đổi buổi',
                'noi_dung' => 'Học viên ' . $user->ho_ten . ' đã đồng ý đổi lịch học.',
                'url' => '/gia-su/quan-ly/lich-day',
                'da_doc' => false,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã đồng ý yêu cầu đổi buổi học.',
        ]);
    }

    private function dinhDangGoiHocChoHocVien(GoiHoc $goiHoc): array
    {
        $lichHocsHienThi = $goiHoc->lichHocs;
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
            'kieuGoi' => $this->kieuGoiHoc($goiHoc),
            'hocDinhKy' => $this->laGoiDinhKy($goiHoc),
            'giaSu' => $goiHoc->giasu?->user?->ho_ten ?? 'Gia su',
            'ngayBatDau' => $goiHoc->ngay_batdau,
            'ngayKetThuc' => $ngayKetThuc,
            'soBuoi' => $goiHoc->so_buoi,
            'soBuoiDaLenLich' => $lichHocsHienThi->where('trang_thai', '!=', 'dahuy')->count(),
            'hinhThuc' => $goiHoc->hinh_thuc_hoc === 'online' ? 'Online' : 'Tại nhà',
            'diaDiem' => $goiHoc->dia_chi_hoc ?: ($goiHoc->hinh_thuc_hoc === 'online' ? 'Online' : 'Chưa cập nhật'),
            'tongTien' => (float) $goiHoc->tong_tien,
            'trangThai' => $trangThai,
            'coTheHuy' => $goiHoc->trang_thai === 'cho_xacnhan',
            'coTheThanhToan' => $goiHoc->trang_thai === 'cho_thanhtoan'
                && $this->kieuGoiHoc($goiHoc) !== 'hoc_thu'
                && (float) $goiHoc->tong_tien > 0
                && ! in_array($goiHoc->thanhToanMoiNhat?->trang_thai, ['cho_thanhtoan', 'da_thanhtoan'], true),
            'thanhToan' => $goiHoc->thanhToanMoiNhat ? $this->dinhDangThanhToan($goiHoc->thanhToanMoiNhat) : null,
            'lichHoc' => $lichHocsHienThi
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
        $lichHoc = $this->kiemTraVaTuDongChotQuaHan($lichHoc);

        $ngayHoc = Carbon::parse($lichHoc->ngay_hoc);
        $bayGio = $this->bayGioLichHoc();
        $daToiGioBatDau = $bayGio->gte($this->thoiDiemLichHoc($lichHoc, 'gio_batdau'));
        $daQuaGioKetThuc = $bayGio->gte($this->thoiDiemLichHoc($lichHoc, 'gio_ketthuc'));
        $daDenNgayHoc = $this->daDenNgayHoc($lichHoc);
        $yeuCauHocBuMoiNhat = $lichHoc->relationLoaded('yeuCauHocBus')
            ? $lichHoc->yeuCauHocBus->sortByDesc('created_at')->first()
            : null;
        $trangThaiGoc = $lichHoc->trang_thai;
        if ($trangThaiGoc === 'cho_xacnhan' && in_array($lichHoc->goiHoc?->trang_thai, ['danghoc', 'hoanthanh'], true)) {
            $trangThaiGoc = 'da_nhan';
        }
        $trangThai = [
            'cho_xacnhan' => 'cho_xacnhan',
            'da_nhan' => 'da_nhan',
            'hoanthanh' => 'hoan_thanh',
            'dahuy' => 'da_huy',
        ][$trangThaiGoc] ?? $trangThaiGoc;
        $xacNhan = $this->thongTinXacNhanLichHoc($lichHoc);
        $kieuGoi = $lichHoc->goiHoc ? $this->kieuGoiHoc($lichHoc->goiHoc) : null;
        $thongTinDoiLich = $this->thongTinBuoiMoiDaDoiLich($lichHoc);
        $daDoiLich = $thongTinDoiLich !== null;

        return [
            'id' => $lichHoc->id,
            'ma' => 'LH' . str_pad((string) $lichHoc->id, 6, '0', STR_PAD_LEFT),
            'mon' => $lichHoc->goiHoc?->monHoc?->ten_mon ?? 'Mon hoc',
            'giaSu' => $lichHoc->giasu?->user?->ho_ten ?? 'Gia su',
            'ngayHoc' => $ngayHoc->toDateString(),
            'thu' => $this->tenThu($ngayHoc->isoWeekday()),
            'gioBatDau' => substr((string) $lichHoc->gio_batdau, 0, 5),
            'gioKetThuc' => substr((string) $lichHoc->gio_ketthuc, 0, 5),
            'hinhThuc' => $lichHoc->hinh_thuc_hoc === 'online' ? 'Online' : 'Tại nhà',
            'diaDiem' => $lichHoc->dia_chi_hoc ?: ($lichHoc->hinh_thuc_hoc === 'online' ? 'Online' : 'Chưa cập nhật'),
            'linkHocOnline' => $lichHoc->link_hoc_online,
            'trangThai' => $trangThai,
            'loaiBuoi' => $lichHoc->loai_buoi === 'hoc_bu' ? 'Học bù' : 'Học thường',
            'kieuGoi' => $kieuGoi,
            'loaiGoi' => $lichHoc->goiHoc ? $this->nhanLoaiGoi($lichHoc->goiHoc) : null,
            'ghiChu' => $lichHoc->ghi_chu,
            'lyDoHuy' => $lichHoc->lydo_huy,
            'daToiGioBatDau' => $daToiGioBatDau,
            'daQuaGioKetThuc' => $daQuaGioKetThuc,
            'coTheXacNhanHoanThanh' => $daDenNgayHoc
                && $trangThaiGoc === 'da_nhan'
                && ! $xacNhan['hocVienDaXacNhan'],
            'xacNhan' => $xacNhan,
            'hocVienXacNhan' => [
                'trangThai' => $xacNhan['hocVienDaXacNhan'] ? 'daxacnhan' : null,
                'thoiGian' => null,
                'ghiChu' => null,
            ],
            'giaSuXacNhan' => [
                'trangThai' => $xacNhan['giaSuDaXacNhan'] ? 'daxacnhan' : null,
                'thoiGian' => null,
                'ghiChu' => null,
            ],
            'daDoiLich' => $daDoiLich,
            'thongTinDoiLich' => $thongTinDoiLich,
            'coTheDanhGia' => $xacNhan['hocVienDaXacNhan'] && $lichHoc->trang_thai === 'hoanthanh' && ! $lichHoc->danhGia,
            'coTheDoiBuoi' => in_array($trangThaiGoc, ['cho_xacnhan', 'da_nhan'], true)
                && $kieuGoi !== 'hoc_thu'
                && ! $daDoiLich
                && ! $daToiGioBatDau
                && ! $yeuCauHocBuMoiNhat,
            'danhGia' => $lichHoc->danhGia ? $this->dinhDangDanhGia($lichHoc->danhGia) : null,
            'yeuCauDoiBuoi' => $yeuCauHocBuMoiNhat ? $this->dinhDangYeuCauHocBu($yeuCauHocBuMoiNhat) : null,
        ];
    }

    private function thongTinBuoiMoiDaDoiLich(LichHoc $lichHoc): ?array
    {
        $ghiChu = (string) $lichHoc->ghi_chu;
        if (! str_contains($ghiChu, 'Tao buoi moi tu')) {
            return null;
        }

        preg_match('/Tao buoi moi tu\s+(LH\d+)/', $ghiChu, $matches);

        return [
            'maBuoiGoc' => $matches[1] ?? null,
            'ngayHocText' => Carbon::parse($lichHoc->ngay_hoc)->format('d/m/Y'),
            'khungGio' => substr((string) $lichHoc->gio_batdau, 0, 5) . ' - ' . substr((string) $lichHoc->gio_ketthuc, 0, 5),
        ];
    }

    private function thongTinXacNhanLichHoc(LichHoc $lichHoc): array
    {
        $ghiChu = (string) $lichHoc->ghi_chu;
        $hocVienDaXacNhan = str_contains($ghiChu, self::DAU_HOCVIEN_XACNHAN);
        $giaSuDaXacNhan = str_contains($ghiChu, self::DAU_GIASU_XACNHAN);
        return [
            'hocVienDaXacNhan' => $hocVienDaXacNhan,
            'giaSuDaXacNhan' => $giaSuDaXacNhan,
            'duHaiBenXacNhan' => $hocVienDaXacNhan && $giaSuDaXacNhan,
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
            'ngayHoc' => $yeuCau->ngay_hoc ? Carbon::parse($yeuCau->ngay_hoc)->toDateString() : null,
            'ngayHocText' => $yeuCau->ngay_hoc ? Carbon::parse($yeuCau->ngay_hoc)->format('d/m/Y') : null,
            'gioBatDau' => substr((string) $yeuCau->gio_batdau, 0, 5),
            'gioKetThuc' => substr((string) $yeuCau->gio_ketthuc, 0, 5),
            'khungGio' => substr((string) $yeuCau->gio_batdau, 0, 5) . ' - ' . substr((string) $yeuCau->gio_ketthuc, 0, 5),
            'lyDo' => $yeuCau->ly_do,
            'trangThai' => $yeuCau->trang_thai,
            'trangThaiText' => $this->tenTrangThaiYeuCauHocBu($yeuCau->trang_thai),
            'ngayYeuCau' => $yeuCau->ngay_yeu_cau?->format('d/m/Y H:i') ?? '',
            'ngayXuLy' => $yeuCau->ngay_xu_ly?->format('d/m/Y H:i') ?? null,
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

    private function themDongGhiChu(?string $ghiChuCu, string $tieuDe, ?string $noiDung = null): string
    {
        $dongMoi = '[' . now()->format('d/m/Y H:i') . '] ' . $tieuDe;
        if (filled($noiDung)) {
            $dongMoi .= ': ' . trim((string) $noiDung);
        }

        return trim(trim((string) $ghiChuCu) . "\n\n" . $dongMoi);
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

    private function kiemTraVaTuDongChotQuaHan(LichHoc $lichHoc): LichHoc
    {
        $ghiChu = (string) $lichHoc->ghi_chu;
        $giaSuDaXacNhan = str_contains($ghiChu, self::DAU_GIASU_XACNHAN);
        $hocVienChuaXacNhan = !str_contains($ghiChu, self::DAU_HOCVIEN_XACNHAN);

        if (!$giaSuDaXacNhan || !$hocVienChuaXacNhan) {
            return $lichHoc;
        }

       

        $thoiDiemGiaSuXacNhan = $lichHoc->updated_at;

        if ($thoiDiemGiaSuXacNhan->copy()->addHours(36)->isPast()) {
            $lichHoc->ghi_chu = $this->themDongGhiChu(
                $lichHoc->ghi_chu,
                self::DAU_HOCVIEN_XACNHAN,
                'Hệ thống tự động xác nhận do quá 36 tiếng.'
            );
            $lichHoc->trang_thai = 'hoanthanh';
            $lichHoc->save();

            $goiHoc = $lichHoc->goiHoc;
            if ($goiHoc && ! $goiHoc->lichHocs()->whereNotIn('trang_thai', ['hoanthanh', 'dahuy'])->exists()) {
                $goiHoc->update(['trang_thai' => 'hoanthanh']);

                \App\Models\User::query()
                    ->where('vai_tro', 'admin')
                    ->get(['id'])
                    ->each(fn ($admin) => \App\Models\ThongBao::create([
                        'user_id' => $admin->id,
                        'tieu_de' => 'Gói học đã hoàn thành',
                        'noi_dung' => 'Gói học GH' . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT) . ' đã hoàn tất tất cả buổi học và chuyển sang trạng thái hoàn thành.',
                        'url' => '/admin/quan-ly-dat-goi#danh_sach_goi_hoc',
                        'da_doc' => false,
                    ]));
            }


            if ($lichHoc->giasu?->user_id) {
                \App\Models\ThongBao::create([
                    'user_id' => $lichHoc->giasu->user_id,
                    'tieu_de' => 'Hệ thống tự động xác nhận buổi học',
                    'noi_dung' => 'Hệ thống đã tự động ghi nhận hoàn thành buổi học do quá 36 tiếng học viên không phản hồi.',
                    'url' => '/gia-su/quan-ly/lich-day',
                    'da_doc' => false,
                ]);
            }

  
            $hocVienId = $lichHoc->goiHoc?->hocvien_id;
            if ($hocVienId) {
                \App\Models\ThongBao::create([
                    'user_id' => $hocVienId,
                    'tieu_de' => 'Hệ thống tự động xác nhận buổi học',
                    'noi_dung' => 'Hệ thống đã tự động ghi nhận hoàn thành buổi học do quá 36 tiếng.',
                    'url' => '/hoc-vien/lich-hoc',
                    'da_doc' => false,
                ]);
            }

            \App\Services\NhatKyHeThongService::ghi(
                null,
                'tu_dong_xac_nhan',
                $lichHoc->id,
                'Hệ thống tự động chốt hoàn thành buổi học LH' . str_pad((string) $lichHoc->id, 6, '0', STR_PAD_LEFT) . ' do quá hạn 36 tiếng.',
                'Hệ Thống'
            );
        }

        return $lichHoc;
    }
}

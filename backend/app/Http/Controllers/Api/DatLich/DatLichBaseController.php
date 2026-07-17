<?php

namespace App\Http\Controllers\Api\DatLich;

use App\Http\Controllers\Controller;
use App\Models\Giasu;
use App\Models\GiasuGia;
use App\Models\GoiHoc;
use App\Models\DanhGia;
use App\Models\LichHoc;
use App\Models\LoaiGoi;
use App\Models\MonHoc;
use App\Models\PhanHoi;
use App\Models\ThanhToan;
use App\Models\ThongBao;
use App\Models\User;
use App\Models\YeuCauHocBu;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\Rule;

class DatLichBaseController extends Controller
{
    protected const DAU_HOCVIEN_XACNHAN = 'Hoc vien xac nhan hoan thanh';
    protected const DAU_GIASU_XACNHAN = 'Gia su xac nhan hoan thanh buoi hoc';
    protected const MUI_GIO_LICH_HOC = 'Asia/Ho_Chi_Minh';

    protected function bayGioLichHoc(): Carbon
    {
        return Carbon::now(self::MUI_GIO_LICH_HOC);
    }

    protected function thoiDiemLichHoc(LichHoc $lichHoc, string $cotGio): Carbon
    {
        return Carbon::parse($lichHoc->ngay_hoc . ' ' . $lichHoc->{$cotGio}, self::MUI_GIO_LICH_HOC);
    }

    protected function daDenNgayHoc(LichHoc $lichHoc): bool
    {
        return $this->bayGioLichHoc()->gte(
            Carbon::parse($lichHoc->ngay_hoc, self::MUI_GIO_LICH_HOC)->startOfDay()
        );
    }

    protected function taoLichHocTuYeuCau(array $duLieu): array
    {
        if ($duLieu['loai_goi'] === 'hoc_thu') {
            return [
                $this->taoMotBuoi($duLieu['ngay_batdau'], $duLieu['gio_batdau'], $duLieu['gio_ketthuc']),
            ];
        }

        if ($duLieu['loai_goi'] === 'khong_dinh_ky') {
            return collect($duLieu['buoi_linh_hoat'] ?? [])
                ->map(fn (array $buoi) => $this->taoMotBuoi($buoi['ngay'], $buoi['gio_batdau'], $buoi['gio_ketthuc']))
                ->sortBy(['ngay_hoc', 'gio_batdau'])
                ->values()
                ->all();
        }

        $thuHoc = collect($duLieu['thu_hoc'] ?? [])->unique()->sort()->values()->all();
        $lichHoc = [];
        $ngay = Carbon::parse($duLieu['ngay_batdau'])->startOfDay();

        while (count($lichHoc) < (int) $duLieu['so_buoi']) {
            if (in_array($ngay->isoWeekday(), $thuHoc, true)) {
                $lichHoc[] = $this->taoMotBuoi($ngay->toDateString(), $duLieu['gio_batdau'], $duLieu['gio_ketthuc']);
            }

            $ngay->addDay();
        }

        return $lichHoc;
    }

    protected function layGiaSuDangNhap(Request $request): ?Giasu
    {
        $user = $request->user();

        if (! $user || $user->vai_tro !== 'giasu') {
            return null;
        }

        return Giasu::query()
            ->where('user_id', $user->id)
            ->first();
    }

    protected function taoMotBuoi(string $ngayHoc, string $gioBatDau, string $gioKetThuc): array
    {
        $batDau = Carbon::createFromFormat('H:i', $gioBatDau);
        $ketThuc = Carbon::createFromFormat('H:i', $gioKetThuc);

        if ($ketThuc->lessThanOrEqualTo($batDau)) {
            abort(response()->json([
                'success' => false,
                'message' => 'Gio ket thuc phai sau gio bat dau.',
            ], 422));
        }

        $gioSomNhat = Carbon::createFromFormat('H:i', '07:00');
        $gioMuonNhat = Carbon::createFromFormat('H:i', '19:30');

        if ($batDau->lessThan($gioSomNhat) || $batDau->greaterThan($gioMuonNhat)) {
            abort(response()->json([
                'success' => false,
                'message' => 'Gio bat dau phai trong khoang 07:00 - 19:30.',
            ], 422));
        }

        $soPhut = (int) round($batDau->diffInMinutes($ketThuc));

        if ($soPhut !== 90) {
            abort(response()->json([
                'success' => false,
                'message' => 'Moi buoi hoc phai keo dai dung 1 gio 30 phut.',
            ], 422));
        }

        return [
            'ngay_hoc' => Carbon::parse($ngayHoc)->toDateString(),
            'gio_batdau' => $gioBatDau,
            'gio_ketthuc' => $gioKetThuc,
            'so_gio' => $soPhut / 60,
        ];
    }

    protected function kiemTraGoiHocTrung(int $hocVienId, int $giaSuId, int $monHocId): void
    {
        $daCoGoiDangMo = GoiHoc::query()
            ->where('hocvien_id', $hocVienId)
            ->where('monhoc_id', $monHocId)
            ->whereIn('trang_thai', ['cho_xacnhan', 'cho_thanhtoan', 'danghoc'])
            ->exists();

        if ($daCoGoiDangMo) {
            abort(response()->json([
                'success' => false,
                'message' => 'Ban da co goi hoc dang xu ly hoac dang hoc cho mon hoc nay.',
            ], 422));
        }
    }

    protected function kiemTraTrungLichDatGoi(int $hocVienId, int $giaSuId, array $lichHocNhap): void
    {
        $this->kiemTraTrungTrongYeuCau($lichHocNhap);

        foreach ($lichHocNhap as $lichHoc) {
            if ($this->coLichTrungCuaGiaSu($giaSuId, $lichHoc)) {
                abort(response()->json([
                    'success' => false,
                    'message' => 'Khung gio ' . $lichHoc['ngay_hoc'] . ' ' . $lichHoc['gio_batdau'] . ' - ' . $lichHoc['gio_ketthuc'] . ' da co lich cua gia su.',
                ], 422));
            }

            if ($this->coLichTrungCuaHocVien($hocVienId, $lichHoc)) {
                abort(response()->json([
                    'success' => false,
                    'message' => 'Ban da co lich hoc trung khung gio ' . $lichHoc['ngay_hoc'] . ' ' . $lichHoc['gio_batdau'] . ' - ' . $lichHoc['gio_ketthuc'] . '.',
                ], 422));
            }
        }
    }

    protected function kiemTraLichHocTrongTuongLai(array $lichHocNhap): void
    {
        $bayGio = $this->bayGioLichHoc();

        foreach ($lichHocNhap as $lichHoc) {
            $batDau = Carbon::parse($lichHoc['ngay_hoc'] . ' ' . $lichHoc['gio_batdau'], self::MUI_GIO_LICH_HOC);

            if ($batDau->lessThanOrEqualTo($bayGio)) {
                abort(response()->json([
                    'success' => false,
                    'message' => 'Ngay va gio hoc phai lon hon thoi diem hien tai.',
                ], 422));
            }
        }
    }

    protected function kiemTraTrungTrongYeuCau(array $lichHocNhap): void
    {
        foreach ($lichHocNhap as $index => $lichHoc) {
            foreach ($lichHocNhap as $indexKhac => $lichHocKhac) {
                if ($index >= $indexKhac || $lichHoc['ngay_hoc'] !== $lichHocKhac['ngay_hoc']) {
                    continue;
                }

                if ($this->haiKhungGioTrungNhau($lichHoc['gio_batdau'], $lichHoc['gio_ketthuc'], $lichHocKhac['gio_batdau'], $lichHocKhac['gio_ketthuc'])) {
                    abort(response()->json([
                        'success' => false,
                        'message' => 'Cac buoi hoc vua chon bi trung khung gio.',
                    ], 422));
                }
            }
        }
    }

    protected function coLichTrungCuaGiaSu(int $giaSuId, array $lichHoc): bool
    {
        return LichHoc::query()
            ->where('giasu_id', $giaSuId)
            ->where('ngay_hoc', $lichHoc['ngay_hoc'])
            ->where('trang_thai', '!=', 'dahuy')
            ->whereHas('goiHoc', fn ($query) => $this->apDungDieuKienLichDaDuocGiu($query))
            ->where('gio_batdau', '<', $lichHoc['gio_ketthuc'])
            ->where('gio_ketthuc', '>', $lichHoc['gio_batdau'])
            ->exists();
    }

    protected function coLichTrungCuaHocVien(int $hocVienId, array $lichHoc): bool
    {
        return LichHoc::query()
            ->where('ngay_hoc', $lichHoc['ngay_hoc'])
            ->where('trang_thai', '!=', 'dahuy')
            ->whereHas('goiHoc', function ($query) use ($hocVienId) {
                $query
                    ->where('hocvien_id', $hocVienId)
                    ->where(fn ($query) => $this->apDungDieuKienLichDaDuocGiu($query));
            })
            ->where('gio_batdau', '<', $lichHoc['gio_ketthuc'])
            ->where('gio_ketthuc', '>', $lichHoc['gio_batdau'])
            ->exists();
    }

    protected function apDungDieuKienLichDaDuocGiu(Builder $query): Builder
    {
        return $query
            ->whereIn('trang_thai', ['cho_thanhtoan', 'danghoc', 'hoanthanh'])
            ->orWhereHas('phanHois', fn ($phanHoi) => $phanHoi->where('phan_hoi', PhanHoi::DONG_Y));
    }

    protected function haiKhungGioTrungNhau(string $batDauA, string $ketThucA, string $batDauB, string $ketThucB): bool
    {
        return $batDauA < $ketThucB && $ketThucA > $batDauB;
    }

    protected function laGoiHocThu(GoiHoc $goiHoc): bool
    {
        return $this->kieuGoiHoc($goiHoc) === 'hoc_thu';
    }

    protected function goiHocCanThanhToan(GoiHoc $goiHoc): bool
    {
        return ! $this->laGoiHocThu($goiHoc) && (float) $goiHoc->tong_tien > 0;
    }

    protected function laGoiDinhKy(GoiHoc $goiHoc): bool
    {
        return $this->kieuGoiHoc($goiHoc) === 'dinh_ky';
    }

    protected function kieuGoiHoc(GoiHoc $goiHoc): string
    {
        if (in_array($goiHoc->kieu_goi, ['hoc_thu', 'dinh_ky', 'khong_dinh_ky'], true)) {
            return $goiHoc->kieu_goi;
        }

        if ($goiHoc->hoc_dinhky) {
            return 'dinh_ky';
        }

        return (int) $goiHoc->so_buoi === 1 ? 'hoc_thu' : 'khong_dinh_ky';
    }

    protected function tenKieuGoiHoc(GoiHoc $goiHoc): string
    {
        return match ($this->kieuGoiHoc($goiHoc)) {
            'dinh_ky' => 'Dinh ky',
            'hoc_thu' => 'Hoc thu',
            default => 'Khong dinh ky',
        };
    }

    protected function dinhDangGoiHoc(GoiHoc $goiHoc): array
    {
        return [
            'id' => $goiHoc->id,
            'ma' => 'GH' . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT),
            'trang_thai' => $goiHoc->trang_thai,
            'tong_tien' => (float) $goiHoc->tong_tien,
            'so_buoi' => $goiHoc->so_buoi,
            'ngay_batdau' => $goiHoc->ngay_batdau,
            'ngay_ketthuc' => $goiHoc->ngay_ketthuc,
            'lich_hoc' => $goiHoc->lichHocs
                ->sortBy(['ngay_hoc', 'gio_batdau'])
                ->map(fn (LichHoc $lichHoc) => [
                    'id' => $lichHoc->id,
                    'ma' => 'LH' . str_pad((string) $lichHoc->id, 6, '0', STR_PAD_LEFT),
                    'ngay_hoc' => $lichHoc->ngay_hoc,
                    'gio_batdau' => $lichHoc->gio_batdau,
                    'gio_ketthuc' => $lichHoc->gio_ketthuc,
                    'trang_thai' => $lichHoc->trang_thai,
                ])
                ->values(),
        ];
    }

    protected function dinhDangGoiHocChoHocVien(GoiHoc $goiHoc): array
    {
        $lichHocsHienThi = $goiHoc->lichHocs
            ->reject(fn (LichHoc $lichHoc) => $this->laBuoiGocDaDoiLich($lichHoc))
            ->values();
        $trangThai = [
            'cho_xacnhan' => 'cho_xacnhan',
            'cho_thanhtoan' => 'cho_thanhtoan',
            'danghoc' => 'dang_hoc',
            'hoanthanh' => 'hoan_thanh',
            'dahuy' => 'da_huy',
        ][$goiHoc->trang_thai] ?? $goiHoc->trang_thai;
        $ngayKetThuc = $this->ngayKetThucGoiHocHienThi($goiHoc);

        return [
            'id' => $goiHoc->id,
            'ma' => 'GH' . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT),
            'mon' => $goiHoc->monHoc?->ten_mon ?? 'Mon hoc',
            'kieuGoi' => $this->kieuGoiHoc($goiHoc),
            'giaSu' => $goiHoc->giasu?->user?->ho_ten ?? 'Gia su',
            'ngayBatDau' => $goiHoc->ngay_batdau,
            'ngayKetThuc' => $ngayKetThuc,
            'soBuoi' => $goiHoc->so_buoi,
            'soBuoiDaLenLich' => $lichHocsHienThi->count(),
            'hinhThuc' => $goiHoc->hinh_thuc_hoc === 'online' ? 'Online' : 'Tại nhà',
            'diaDiem' => $goiHoc->dia_chi_hoc ?: ($goiHoc->hinh_thuc_hoc === 'online' ? 'Online' : 'Chưa cập nhật'),
            'tongTien' => (float) $goiHoc->tong_tien,
            'trangThai' => $trangThai,
            'coTheHuy' => $goiHoc->trang_thai === 'cho_xacnhan',
            'coTheThanhToan' => $goiHoc->trang_thai === 'cho_thanhtoan'
                && $this->goiHocCanThanhToan($goiHoc)
                && ! in_array($goiHoc->thanhToanMoiNhat?->trang_thai, ['cho_thanhtoan', 'da_thanhtoan'], true),
            'thanhToan' => $goiHoc->thanhToanMoiNhat ? $this->dinhDangThanhToan($goiHoc->thanhToanMoiNhat) : null,
            'lichHoc' => $lichHocsHienThi
                ->map(fn (LichHoc $lichHoc) => $this->dinhDangLichHoc($lichHoc))
                ->values(),
        ];
    }

    protected function laBuoiGocDaDoiLich(LichHoc $lichHoc): bool
    {
        if ($lichHoc->trang_thai !== 'dahuy') {
            return false;
        }

        $yeuCauMoiNhat = $lichHoc->relationLoaded('yeuCauHocBus')
            ? $lichHoc->yeuCauHocBus->sortByDesc('created_at')->first()
            : null;

        return $yeuCauMoiNhat?->trang_thai === 'da_duyet';
    }

    protected function ngayKetThucGoiHocHienThi(GoiHoc $goiHoc): ?string
    {
        if (! $goiHoc->ngay_batdau || ! $this->laGoiDinhKy($goiHoc)) {
            return $goiHoc->ngay_ketthuc;
        }

        $soThang = (int) ($goiHoc->loaiGoi?->so_thang ?: 1);

        return Carbon::parse($goiHoc->ngay_batdau)
            ->addDays(max($soThang * 30, 1) - 1)
            ->toDateString();
    }

    protected function dinhDangGoiHocChoAdmin(GoiHoc $goiHoc): array
    {
        $lichHocs = $goiHoc->lichHocs->sortBy(['ngay_hoc', 'gio_batdau'])->values();
        $lichDau = $lichHocs->first();
        $phanHoiMoiNhat = $goiHoc->phanHoiMoiNhat;
        $thanhToanMoiNhat = $goiHoc->thanhToanMoiNhat;
        $trangThai = match ($goiHoc->trang_thai) {
            'cho_thanhtoan' => 'cho_thanh_toan',
            'danghoc' => 'dang_hoc',
            'hoanthanh' => 'hoan_thanh',
            'dahuy' => 'da_huy',
            default => match ($phanHoiMoiNhat?->phan_hoi) {
                PhanHoi::DONG_Y => $this->goiHocCanThanhToan($goiHoc) ? 'cho_thanh_toan' : 'dang_hoc',
                PhanHoi::TU_CHOI => 'da_huy',
                default => 'cho_xu_ly',
            },
        };

        return [
            'id' => $goiHoc->id,
            'ma' => 'GH' . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT),
            'trangThai' => $trangThai,
            'hocVien' => $goiHoc->hocVien?->ho_ten ?? 'Học viên',
            'hocVienEmail' => $goiHoc->hocVien?->email ?? 'Chưa cập nhật',
            'hocVienSdt' => $goiHoc->hocVien?->sdt ?? 'Chưa cập nhật',
            'giaSu' => $goiHoc->giasu?->user?->ho_ten ?? 'Gia sư',
            'giaSuEmail' => $goiHoc->giasu?->user?->email ?? 'Chưa cập nhật',
            'mon' => $goiHoc->monHoc?->ten_mon ?? 'Môn học',
            'capHoc' => $this->tenCapHoacLop($goiHoc->monHoc),
            'loaiGoi' => $this->tenKieuGoiHoc($goiHoc),
            'kieuGoi' => $this->kieuGoiHoc($goiHoc),
            'hocDinhKy' => $this->laGoiDinhKy($goiHoc),
            'soBuoi' => $goiHoc->so_buoi,
            'gioMoiBuoi' => $lichDau ? round(Carbon::parse($lichDau->gio_batdau)->diffInMinutes(Carbon::parse($lichDau->gio_ketthuc)) / 60, 1) : 0,
            'tongTien' => number_format((float) $goiHoc->tong_tien, 0, ',', '.') . 'd',
            'lichMongMuon' => $this->dinhDangLichMongMuon($goiHoc, $lichHocs),
            'ngayMongMuon' => $this->dinhDangNgayMongMuon($goiHoc, $lichHocs),
            'gioMongMuon' => $this->dinhDangGioMongMuon($lichHocs),
            'hinhThuc' => $goiHoc->hinh_thuc_hoc === 'online' ? 'Online' : 'Tại nhà',
            'diaDiem' => $goiHoc->dia_chi_hoc ?: ($goiHoc->hinh_thuc_hoc === 'online' ? 'Online' : 'Chưa cập nhật'),
            'ngayTao' => $goiHoc->created_at?->format('d/m/Y H:i') ?? '',
            'daGuiGiaSuLuc' => null,
            'phanHoi' => $phanHoiMoiNhat ? $this->dinhDangPhanHoi($phanHoiMoiNhat) : null,
            'thanhToan' => $thanhToanMoiNhat ? $this->dinhDangThanhToan($thanhToanMoiNhat) : null,
            'lichHoc' => $lichHocs
                ->map(fn (LichHoc $lichHoc) => $this->dinhDangLichHoc($lichHoc))
                ->values(),
        ];
    }

    protected function dinhDangYeuCauChoGiaSu(GoiHoc $goiHoc): array
    {
        $lichHocs = $goiHoc->lichHocs->sortBy(['ngay_hoc', 'gio_batdau'])->values();
        $lichDau = $lichHocs->first();
        $phanHoiMoiNhat = $goiHoc->phanHoiMoiNhat;
        $trangThai = match ($phanHoiMoiNhat?->phan_hoi) {
            PhanHoi::DONG_Y => 'da_dong_y',
            PhanHoi::TU_CHOI => 'tu_choi',
            default => 'cho_phan_hoi',
        };

        return [
            'id' => $goiHoc->id,
            'maYeuCau' => 'GH' . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT),
            'guiLuc' => $goiHoc->created_at?->format('d/m/Y H:i') ?? '',
            'trangThai' => $trangThai,
            'hocVien' => $goiHoc->hocVien?->ho_ten ?? 'Học viên',
            'mon' => $goiHoc->monHoc?->ten_mon ?? 'Môn học',
            'capHoc' => $this->tenCapHoacLop($goiHoc->monHoc),
            'lop' => match ($this->kieuGoiHoc($goiHoc)) {
                'dinh_ky' => 'Học định kỳ',
                'hoc_thu' => 'Học thử',
                default => 'Học không định kỳ',
            },
            'soBuoi' => $goiHoc->so_buoi,
            'gioMoiBuoi' => $lichDau ? round(Carbon::parse($lichDau->gio_batdau)->diffInMinutes(Carbon::parse($lichDau->gio_ketthuc)) / 60, 1) : 0,
            'lichMongMuon' => $this->dinhDangLichMongMuon($goiHoc, $lichHocs),
            'ngayBatDau' => $goiHoc->ngay_batdau ? Carbon::parse($goiHoc->ngay_batdau)->format('d/m/Y') : 'Chua cap nhat',
            'hocDinhKy' => $this->laGoiDinhKy($goiHoc),
            'hinhThuc' => $goiHoc->hinh_thuc_hoc === 'online' ? 'Trực tuyến' : 'Trực tiếp',
            'diaDiem' => $goiHoc->dia_chi_hoc ?: ($goiHoc->hinh_thuc_hoc === 'online' ? 'Online' : 'Chưa cập nhật'),
            'donGia' => number_format((float) $goiHoc->don_gia_theogio, 0, ',', '.') . 'd/gio',
            'tongTien' => number_format((float) $goiHoc->tong_tien, 0, ',', '.') . 'd',
            'lyDoTuChoi' => $phanHoiMoiNhat?->phan_hoi === PhanHoi::TU_CHOI ? $phanHoiMoiNhat->ly_do : null,
            'lichHoc' => $lichHocs
                ->map(fn (LichHoc $lichHoc) => $this->dinhDangLichHoc($lichHoc))
                ->values(),
        ];
    }

    protected function dinhDangLichDayChoGiaSu(LichHoc $lichHoc): array
    {
        $lichHoc = $this->kiemTraVaTuDongChotQuaHan($lichHoc); //kiemtra quá hạn

        $goiHoc = $lichHoc->goiHoc;
        $ngayHoc = Carbon::parse($lichHoc->ngay_hoc);
        $bayGio = $this->bayGioLichHoc();
        $daToiGioBatDau = $bayGio->gte($this->thoiDiemLichHoc($lichHoc, 'gio_batdau'));
        $daQuaGioKetThuc = $bayGio->gte($this->thoiDiemLichHoc($lichHoc, 'gio_ketthuc'));
        $daDenNgayHoc = $this->daDenNgayHoc($lichHoc);
        $xacNhan = $this->thongTinXacNhanLichHoc($lichHoc);
        $trangThai = match ($lichHoc->trang_thai) {
            'cho_xacnhan' => 'cho_xac_nhan',
            'da_nhan' => $daDenNgayHoc ? 'cho_xac_nhan' : 'sap_dien_ra',
            'hoanthanh' => 'hoan_thanh',
            'dahuy' => 'da_huy',
            default => 'sap_dien_ra',
        };

        $thongTinDoiLich = $this->thongTinBuoiMoiDaDoiLich($lichHoc);
        $daDoiLich = $thongTinDoiLich !== null;

        return [
            'id' => $lichHoc->id,
            'ma' => 'LH' . str_pad((string) $lichHoc->id, 6, '0', STR_PAD_LEFT),
            'daDoiLich' => $daDoiLich,
            'thongTinDoiLich' => $thongTinDoiLich,
            'batDau' => substr((string) $lichHoc->gio_batdau, 0, 5),
            'ketThuc' => substr((string) $lichHoc->gio_ketthuc, 0, 5),
            'thu' => $this->tenThu($ngayHoc->isoWeekday()),
            'ngayHoc' => $ngayHoc->format('d/m/Y'),
            'loaiBuoi' => $lichHoc->loai_buoi === 'hoc_bu' ? 'Học bù' : ($goiHoc && $this->laGoiHocThu($goiHoc) ? 'Học thử' : 'Học thường'),
            'kieuGoi' => $goiHoc ? $this->kieuGoiHoc($goiHoc) : null,
            'loaiGoi' => $goiHoc ? $this->tenKieuGoiHoc($goiHoc) : null,
            'mon' => $goiHoc?->monHoc?->ten_mon ?? 'Môn học',
            'capHoc' => $this->tenCapHoacLop($goiHoc?->monHoc),
            'hocVien' => $goiHoc?->hocVien?->ho_ten ?? 'Học viên',
            'hinhThuc' => $lichHoc->hinh_thuc_hoc === 'online' ? 'Trực tuyến' : 'Trực tiếp',
            'diaDiem' => $lichHoc->dia_chi_hoc ?: ($lichHoc->hinh_thuc_hoc === 'online' ? 'Online' : 'Chưa cập nhật'),
            'linkHocOnline' => $lichHoc->link_hoc_online,
            'trangThai' => $trangThai,
            'ghiChu' => $lichHoc->ghi_chu ?: 'Không có ghi chú.',
            'daToiGioBatDau' => $daToiGioBatDau,
            'daQuaGioKetThuc' => $daQuaGioKetThuc,
            'coTheXacNhanHoanThanh' => $daDenNgayHoc
                && $lichHoc->trang_thai === 'da_nhan'
                && ! $xacNhan['giaSuDaXacNhan'],
            'xacNhan' => $xacNhan,
        ];
    }

    protected function taiLichHocAdmin(int $lichHocId): LichHoc
    {
        return LichHoc::query()
            ->with([
                'goiHoc:id,hocvien_id,giasu_id,monhoc_id,loai_goi_id,ngay_batdau,ngay_ketthuc,so_buoi,hoc_dinhky,kieu_goi,tong_tien,trang_thai',
                'goiHoc.hocVien:id,ho_ten,email,sdt',
                'goiHoc.monHoc:id,ten_mon,lop,cap_hoc_id',
                'goiHoc.loaiGoi:id,ten_loai_goi,so_thang',
                'giasu:id,user_id',
                'giasu.user:id,ho_ten,email,sdt',
                'danhGia:id,lichhoc_id,so_sao,noi_dung,created_at',
            ])
            ->findOrFail($lichHocId);
    }

    protected function themDongGhiChu(?string $ghiChuCu, string $tieuDe, ?string $noiDung = null): string
    {
        $dongMoi = '[' . now()->format('d/m/Y H:i') . '] ' . $tieuDe;
        if (filled($noiDung)) {
            $dongMoi .= ': ' . trim((string) $noiDung);
        }

        return trim(trim((string) $ghiChuCu) . "\n\n" . $dongMoi);
    }

    protected function thongTinXacNhanLichHoc(LichHoc $lichHoc): array
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

    protected function guiThongBaoXuLyLichHoc(LichHoc $lichHoc, string $tieuDe): void
    {
        $lichHoc->loadMissing(['goiHoc.hocVien:id,ho_ten', 'giasu.user:id,ho_ten']);
        $noiDung = 'Buổi học ngày ' . Carbon::parse($lichHoc->ngay_hoc)->format('d/m/Y')
            . ' lúc ' . substr((string) $lichHoc->gio_batdau, 0, 5)
            . ' - ' . substr((string) $lichHoc->gio_ketthuc, 0, 5)
            . ' đã được admin cập nhật.';

        $nguoiNhan = [
            [$lichHoc->goiHoc?->hocvien_id, '/hoc-vien/lich-hoc'],
            [$lichHoc->giasu?->user_id, '/gia-su/quan-ly/lich-day'],
        ];

        collect($nguoiNhan)
            ->filter(fn ($item) => filled($item[0]))
            ->unique(fn ($item) => $item[0])
            ->each(fn ($item) => ThongBao::create([
                'user_id' => $item[0],
                'tieu_de' => $tieuDe,
                'noi_dung' => $noiDung,
                'url' => $item[1],
                'da_doc' => false,
            ]));
    }

    protected function dinhDangLichHocAdmin(LichHoc $lichHoc): array
    {
        $lichHoc = $this->kiemTraVaTuDongChotQuaHan($lichHoc);

        $goiHoc = $lichHoc->goiHoc;
        $hocVien = $goiHoc?->hocVien;
        $giaSuUser = $lichHoc->giasu?->user;
        $monHoc = $goiHoc?->monHoc;
        $ngayHoc = Carbon::parse($lichHoc->ngay_hoc);
        $xacNhan = $this->thongTinXacNhanLichHoc($lichHoc);
        $trangThaiGoc = $lichHoc->trang_thai;

        return [
            'id' => $lichHoc->id,
            'goiHocId' => $lichHoc->goihoc_id,
            'maGoi' => 'GH' . str_pad((string) $lichHoc->goihoc_id, 6, '0', STR_PAD_LEFT),
            'loaiBuoi' => $lichHoc->loai_buoi,
            'loaiBuoiText' => $lichHoc->loai_buoi === 'hoc_bu' ? 'Học bù' : ($goiHoc && $this->laGoiHocThu($goiHoc) ? 'Học thử' : 'Học thường'),
            'ngayHoc' => $ngayHoc->toDateString(),
            'ngayHocText' => $ngayHoc->format('d/m/Y'),
            'thuText' => $this->tenThu($ngayHoc->isoWeekday()),
            'gioBatDau' => substr((string) $lichHoc->gio_batdau, 0, 5),
            'gioKetThuc' => substr((string) $lichHoc->gio_ketthuc, 0, 5),
            'khungGio' => substr((string) $lichHoc->gio_batdau, 0, 5) . ' - ' . substr((string) $lichHoc->gio_ketthuc, 0, 5),
            'hinhThucHoc' => $lichHoc->hinh_thuc_hoc,
            'hinhThucHocText' => $lichHoc->hinh_thuc_hoc === 'online' ? 'Online' : 'Tại nhà',
            'diaChiHoc' => $lichHoc->dia_chi_hoc,
            'tienHoc' => (float) $lichHoc->tien_hoc,
            'phiHoaHong' => (float) $lichHoc->phi_hoahong,
            'tienGiaSuNhan' => (float) $lichHoc->tien_giasu_nhan,
            'trangThai' => $trangThaiGoc,
            'trangThaiText' => $this->tenTrangThaiLichHoc($trangThaiGoc),
            'ghiChu' => $lichHoc->ghi_chu,
            'lyDoHuy' => $lichHoc->lydo_huy,
            'xacNhan' => $xacNhan,
            'coTheAdminXacNhanHoanThanh' => $trangThaiGoc === 'da_nhan'
                && $xacNhan['duHaiBenXacNhan'],
            'hocVien' => [
                'id' => $hocVien?->id,
                'hoTen' => $hocVien?->ho_ten,
                'email' => $hocVien?->email,
                'sdt' => $hocVien?->sdt,
            ],
            'giaSu' => [
                'id' => $lichHoc->giasu_id,
                'hoTen' => $giaSuUser?->ho_ten,
                'email' => $giaSuUser?->email,
                'sdt' => $giaSuUser?->sdt,
            ],
            'monHoc' => [
                'id' => $monHoc?->id,
                'ten' => $monHoc?->ten_mon,
                'lop' => $monHoc?->lop,
                'tenHienThi' => $monHoc
                    ? trim($monHoc->ten_mon . ($monHoc->lop ? ' - ' . $this->dinhDangLop($monHoc->lop) : ''))
                    : null,
            ],
            'goiHoc' => [
                'id' => $goiHoc?->id,
                'trangThai' => $goiHoc?->trang_thai,
                'trangThaiText' => $goiHoc ? $this->tenTrangThaiGoiHoc($goiHoc->trang_thai) : null,
                'loaiGoi' => $goiHoc?->loaiGoi?->ten_loai_goi,
                'soBuoi' => $goiHoc?->so_buoi,
                'hocDinhKy' => $goiHoc ? $this->laGoiDinhKy($goiHoc) : false,
                'ngayBatDau' => $goiHoc?->ngay_batdau,
                'ngayKetThuc' => $goiHoc?->ngay_ketthuc,
                'tongTien' => (float) ($goiHoc?->tong_tien ?? 0),
            ],
            'danhGia' => $lichHoc->danhGia ? [
                'soSao' => (int) $lichHoc->danhGia->so_sao,
                'binhLuan' => $lichHoc->danhGia->noi_dung,
                'ngayDanhGia' => optional($lichHoc->danhGia->created_at)->format('d/m/Y H:i'),
            ] : null,
        ];
    }

    protected function dinhDangLop(?string $lop): string
    {
        $lop = trim((string) $lop);

        if ($lop === '') {
            return '';
        }

        return str_starts_with(mb_strtolower($lop, 'UTF-8'), 'lớp') ? $lop : 'Lớp ' . $lop;
    }

    protected function tenCapHoacLop(?MonHoc $monHoc): string
    {
        if (! $monHoc) {
            return 'Chưa cập nhật';
        }

        if (filled($monHoc->lop)) {
            return $this->dinhDangLop($monHoc->lop);
        }

        return $monHoc->capHoc?->ten ?? 'Chưa cập nhật';
    }

    protected function dinhDangPhanHoi(PhanHoi $phanHoi): array
    {
        return [
            'ketQua' => $phanHoi->phan_hoi,
            'lyDo' => $phanHoi->ly_do,
            'thoiGian' => $phanHoi->updated_at?->format('d/m/Y H:i') ?? '',
        ];
    }

    protected function luuAnhMinhChungThanhToan(Request $request): string
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

    protected function dinhDangThanhToan(ThanhToan $thanhToan): array
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

    protected function dinhDangPhuongThucThanhToan(?string $phuongThuc): string
    {
        return [
            'tienmat' => 'Tiền mặt',
            'momo' => 'Momo',
            'zalopay' => 'ZaloPay',
            'banking' => 'Chuyển khoản',
        ][$phuongThuc] ?? 'Chưa cập nhật';
    }

    protected function dinhDangLichMongMuon(GoiHoc $goiHoc, Collection $lichHocs): string
    {
        if ($lichHocs->isEmpty()) {
            return $this->dinhDangKhoangNgay($goiHoc->ngay_batdau, $goiHoc->ngay_ketthuc);
        }

        if ($this->laGoiDinhKy($goiHoc)) {
            $danhSachThu = $lichHocs
                ->map(fn (LichHoc $lichHoc) => $this->tenThu(Carbon::parse($lichHoc->ngay_hoc)->isoWeekday()))
                ->unique()
                ->values()
                ->join(', ');

            $danhSachGio = $lichHocs
                ->map(fn (LichHoc $lichHoc) => substr((string) $lichHoc->gio_batdau, 0, 5) . ' - ' . substr((string) $lichHoc->gio_ketthuc, 0, 5))
                ->unique()
                ->values();

            $khungGio = $danhSachGio->count() === 1
                ? $danhSachGio->first()
                : $danhSachGio->count() . ' khung giờ';

            return trim($danhSachThu . ' · ' . $khungGio . ' · ' . $this->dinhDangKhoangNgay($goiHoc->ngay_batdau, $goiHoc->ngay_ketthuc));
        }

        $cacBuoiDau = $lichHocs
            ->take(3)
            ->map(fn (LichHoc $lichHoc) => Carbon::parse($lichHoc->ngay_hoc)->format('d/m') . ' '
                . substr((string) $lichHoc->gio_batdau, 0, 5)
                . ' - '
                . substr((string) $lichHoc->gio_ketthuc, 0, 5))
            ->join('; ');

        $soBuoiConLai = max($lichHocs->count() - 3, 0);

        return $cacBuoiDau . ($soBuoiConLai > 0 ? " (và {$soBuoiConLai} buổi khác)" : '');
    }

    protected function dinhDangNgayMongMuon(GoiHoc $goiHoc, Collection $lichHocs): string
    {
        if ($lichHocs->isEmpty()) {
            return $this->dinhDangKhoangNgay($goiHoc->ngay_batdau, $goiHoc->ngay_ketthuc);
        }

        if ($this->laGoiDinhKy($goiHoc)) {
            $danhSachThu = $lichHocs
                ->map(fn (LichHoc $lichHoc) => $this->tenThu(Carbon::parse($lichHoc->ngay_hoc)->isoWeekday()))
                ->unique()
                ->values()
                ->join(', ');

            return $danhSachThu . ' · ' . $this->dinhDangKhoangNgay($goiHoc->ngay_batdau, $goiHoc->ngay_ketthuc);
        }

        return $lichHocs
            ->take(3)
            ->map(fn (LichHoc $lichHoc) => Carbon::parse($lichHoc->ngay_hoc)->format('d/m/Y'))
            ->join('; ')
            . ($lichHocs->count() > 3 ? ' và ' . ($lichHocs->count() - 3) . ' ngày khác' : '');
    }

    protected function dinhDangGioMongMuon(Collection $lichHocs): string
    {
        if ($lichHocs->isEmpty()) {
            return 'Chua cap nhat';
        }

        $danhSachGio = $lichHocs
            ->map(fn (LichHoc $lichHoc) => substr((string) $lichHoc->gio_batdau, 0, 5) . ' - ' . substr((string) $lichHoc->gio_ketthuc, 0, 5))
            ->unique()
            ->values();

        if ($danhSachGio->count() === 1) {
            return $danhSachGio->first();
        }

        return $danhSachGio->take(3)->join('; ')
            . ($danhSachGio->count() > 3 ? ' +' . ($danhSachGio->count() - 3) . ' khung gio' : '');
    }

    protected function dinhDangKhoangNgay(?string $batDau, ?string $ketThuc): string
    {
        if (! $batDau || ! $ketThuc) {
            return 'Chua cap nhat';
        }

        return Carbon::parse($batDau)->format('d/m/Y') . ' - ' . Carbon::parse($ketThuc)->format('d/m/Y');
    }

    protected function dinhDangLichHoc(LichHoc $lichHoc): array
    {
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
            'trangThai' => $trangThai,
            'loaiBuoi' => $lichHoc->loai_buoi === 'hoc_bu' ? 'Học bù' : ($lichHoc->goiHoc && $this->laGoiHocThu($lichHoc->goiHoc) ? 'Học thử' : 'Học thường'),
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
                && ! $daDoiLich
                && ! $daToiGioBatDau
                && ! $yeuCauHocBuMoiNhat,
            'danhGia' => $lichHoc->danhGia ? $this->dinhDangDanhGia($lichHoc->danhGia) : null,
            'yeuCauDoiBuoi' => $yeuCauHocBuMoiNhat ? $this->dinhDangYeuCauHocBu($yeuCauHocBuMoiNhat) : null,
        ];
    }

    protected function thongTinBuoiMoiDaDoiLich(LichHoc $lichHoc): ?array
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

    protected function dinhDangDanhGia(DanhGia $danhGia): array
    {
        return [
            'id' => $danhGia->id,
            'soSao' => (int) $danhGia->so_sao,
            'noiDung' => $danhGia->noi_dung,
            'ngayDanhGia' => $danhGia->updated_at?->format('d/m/Y H:i') ?? '',
        ];
    }

    protected function dinhDangYeuCauHocBu(YeuCauHocBu $yeuCau): array
    {
        $lichHocGoc = $yeuCau->lichHocGoc;
        $goiHoc = $lichHocGoc?->goiHoc;

        return [
            'id' => $yeuCau->id,
            'maYeuCau' => 'YCD' . str_pad((string) $yeuCau->id, 6, '0', STR_PAD_LEFT),
            'lichHocId' => $lichHocGoc?->id,
            'maLichHoc' => $lichHocGoc ? 'LH' . str_pad((string) $lichHocGoc->id, 6, '0', STR_PAD_LEFT) : null,
            'maGoi' => $goiHoc ? 'GH' . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT) : null,
            'hocVien' => [
                'id' => $goiHoc?->hocVien?->id,
                'hoTen' => $goiHoc?->hocVien?->ho_ten ?? $yeuCau->nguoiYeuCau?->ho_ten,
                'email' => $goiHoc?->hocVien?->email,
                'sdt' => $goiHoc?->hocVien?->sdt,
            ],
            'giaSu' => [
                'id' => $yeuCau->giasu?->id,
                'hoTen' => $yeuCau->giasu?->user?->ho_ten,
                'email' => $yeuCau->giasu?->user?->email,
                'sdt' => $yeuCau->giasu?->user?->sdt,
            ],
            'monHoc' => [
                'ten' => $goiHoc?->monHoc?->ten_mon,
                'lop' => $goiHoc?->monHoc?->lop,
                'tenHienThi' => trim(($goiHoc?->monHoc?->ten_mon ?? 'Mon hoc') . ' - ' . ($goiHoc?->monHoc?->lop ?? '')),
            ],
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

    protected function trangThaiYeuCauDoiBuoiDangXuLy(): array
    {
        return ['cho_duyet', 'cho_gia_su_xac_nhan', 'giasu_dong_y'];
    }

    protected function tenTrangThaiYeuCauHocBu(?string $trangThai): string
    {
        return [
            'cho_duyet' => 'Cho admin xu ly',
            'cho_gia_su_xac_nhan' => 'Cho gia su xac nhan',
            'giasu_dong_y' => 'Gia su dong y',
            'giasu_tu_choi' => 'Gia su tu choi',
            'da_duyet' => 'Da duyet doi buoi',
            'tu_choi' => 'Da tu choi',
        ][$trangThai] ?? 'Chua cap nhat';
    }

    protected function tenTrangThaiLichHoc(?string $trangThai): string
    {
        return [
            'cho_xacnhan' => 'Chờ xác nhận',
            'da_nhan' => 'Đã nhận',
            'hoanthanh' => 'Hoàn thành',
            'dahuy' => 'Đã hủy',
        ][$trangThai] ?? 'Chưa cập nhật';
    }

    protected function tenTrangThaiGoiHoc(?string $trangThai): string
    {
        return [
            'cho_xacnhan' => 'Chờ xác nhận',
            'cho_thanhtoan' => 'Chờ thanh toán',
            'danghoc' => 'Đang học',
            'hoanthanh' => 'Hoàn thành',
            'dahuy' => 'Đã hủy',
        ][$trangThai] ?? 'Chưa cập nhật';
    }

    protected function tenThu(int $isoWeekday): string
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

    protected function kiemTraVaTuDongChotQuaHan(LichHoc $lichHoc): LichHoc
    {
        $ghiChu = (string) $lichHoc->ghi_chu;
        $giaSuDaXacNhan = str_contains($ghiChu, self::DAU_GIASU_XACNHAN);
        $hocVienChuaXacNhan = !str_contains($ghiChu, self::DAU_HOCVIEN_XACNHAN);

        if (!$giaSuDaXacNhan || !$hocVienChuaXacNhan) {
            return $lichHoc;
        }

        $thoiDiemKetThuc = Carbon::parse($lichHoc->ngay_hoc . ' ' . $lichHoc->gio_ketthuc, self::MUI_GIO_LICH_HOC);

        if ($thoiDiemKetThuc->copy()->addHours(8)->isPast()) {
            $lichHoc->ghi_chu = $this->themDongGhiChu(
                $lichHoc->ghi_chu,
                self::DAU_HOCVIEN_XACNHAN,
                'Hệ thống tự động xác nhận do quá 8 tiếng.'
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
                    'noi_dung' => 'Hệ thống đã tự động ghi nhận hoàn thành buổi học do quá 8 tiếng học viên không phản hồi.',
                    'url' => '/gia-su/quan-ly/lich-day',
                    'da_doc' => false,
                ]);
            }

            $hocVienId = $lichHoc->goiHoc?->hocvien_id;
            if ($hocVienId) {
                \App\Models\ThongBao::create([
                    'user_id' => $hocVienId,
                    'tieu_de' => 'Hệ thống tự động xác nhận buổi học',
                    'noi_dung' => 'Hệ thống đã tự động ghi nhận hoàn thành buổi học do quá 8 tiếng.',
                    'url' => '/hoc-vien/lich-hoc',
                    'da_doc' => false,
                ]);
            }

            \App\Services\NhatKyHeThongService::ghi(
                null, 
                'tu_dong_xac_nhan',
                $lichHoc->id,
                'Hệ thống tự động chốt hoàn thành buổi học LH' . str_pad((string) $lichHoc->id, 6, '0', STR_PAD_LEFT) . ' do quá hạn 8 tiếng.',
                'Hệ Thống'
            );
        }

        return $lichHoc;
    }
}

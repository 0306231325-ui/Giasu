<?php

namespace App\Http\Controllers\Api\DatLich;

use App\Http\Controllers\Controller;
use App\Models\Giasu;
use App\Models\GiasuGia;
use App\Models\GoiHoc;
use App\Models\DanhGia;
use App\Models\LichHoc;
use App\Models\LoaiGoi;
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
    protected const DAU_GIASU_XACNHAN = 'Gia su xac nhan hoan thanh';
    protected const DAU_HOCVIEN_BAO_VAN_DE = 'Hoc vien bao van de';
    protected const DAU_GIASU_BAO_VAN_DE = 'Gia su bao van de';

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
            'danghoc' => 'da_tao_lich',
            'hoanthanh' => 'da_tao_lich',
            'dahuy' => 'da_huy',
            default => match ($phanHoiMoiNhat?->phan_hoi) {
                PhanHoi::DONG_Y => 'giasu_dong_y',
                PhanHoi::TU_CHOI => 'giasu_tu_choi',
                default => 'cho_xu_ly',
            },
        };

        return [
            'id' => $goiHoc->id,
            'ma' => 'GH' . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT),
            'trangThai' => $trangThai,
            'hocVien' => $goiHoc->hocVien?->ho_ten ?? 'Hoc vien',
            'hocVienEmail' => $goiHoc->hocVien?->email ?? 'Chua cap nhat',
            'hocVienSdt' => $goiHoc->hocVien?->sdt ?? 'Chua cap nhat',
            'giaSu' => $goiHoc->giasu?->user?->ho_ten ?? 'Gia su',
            'giaSuEmail' => $goiHoc->giasu?->user?->email ?? 'Chua cap nhat',
            'mon' => $goiHoc->monHoc?->ten_mon ?? 'Mon hoc',
            'capHoc' => $goiHoc->monHoc?->lop ?? 'Chua cap nhat',
            'loaiGoi' => $this->tenKieuGoiHoc($goiHoc),
            'hocDinhKy' => $this->laGoiDinhKy($goiHoc),
            'soBuoi' => $goiHoc->so_buoi,
            'gioMoiBuoi' => $lichDau ? round(Carbon::parse($lichDau->gio_batdau)->diffInMinutes(Carbon::parse($lichDau->gio_ketthuc)) / 60, 1) : 0,
            'tongTien' => number_format((float) $goiHoc->tong_tien, 0, ',', '.') . 'd',
            'lichMongMuon' => $this->dinhDangLichMongMuon($goiHoc, $lichHocs),
            'ngayMongMuon' => $this->dinhDangNgayMongMuon($goiHoc, $lichHocs),
            'gioMongMuon' => $this->dinhDangGioMongMuon($lichHocs),
            'hinhThuc' => $goiHoc->hinh_thuc_hoc === 'online' ? 'Online' : 'Tai nha',
            'diaDiem' => $goiHoc->dia_chi_hoc ?: ($goiHoc->hinh_thuc_hoc === 'online' ? 'Online' : 'Chua cap nhat'),
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
            'hocVien' => $goiHoc->hocVien?->ho_ten ?? 'Hoc vien',
            'mon' => $goiHoc->monHoc?->ten_mon ?? 'Mon hoc',
            'capHoc' => $goiHoc->monHoc?->lop ?? 'Chua cap nhat',
            'lop' => match ($this->kieuGoiHoc($goiHoc)) {
                'dinh_ky' => 'Hoc dinh ky',
                'hoc_thu' => 'Hoc thu',
                default => 'Hoc khong dinh ky',
            },
            'soBuoi' => $goiHoc->so_buoi,
            'gioMoiBuoi' => $lichDau ? round(Carbon::parse($lichDau->gio_batdau)->diffInMinutes(Carbon::parse($lichDau->gio_ketthuc)) / 60, 1) : 0,
            'lichMongMuon' => $this->dinhDangLichMongMuon($goiHoc, $lichHocs),
            'ngayBatDau' => $goiHoc->ngay_batdau ? Carbon::parse($goiHoc->ngay_batdau)->format('d/m/Y') : 'Chua cap nhat',
            'hocDinhKy' => $this->laGoiDinhKy($goiHoc),
            'hinhThuc' => $goiHoc->hinh_thuc_hoc === 'online' ? 'Trực tuyến' : 'Trực tiếp',
            'diaDiem' => $goiHoc->dia_chi_hoc ?: ($goiHoc->hinh_thuc_hoc === 'online' ? 'Online' : 'Chua cap nhat'),
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
        $goiHoc = $lichHoc->goiHoc;
        $ngayHoc = Carbon::parse($lichHoc->ngay_hoc);
        $daToiGioBatDau = now()->gte(Carbon::parse($lichHoc->ngay_hoc . ' ' . $lichHoc->gio_batdau));
        $daQuaGioKetThuc = now()->gte(Carbon::parse($lichHoc->ngay_hoc . ' ' . $lichHoc->gio_ketthuc));
        $xacNhan = $this->thongTinXacNhanLichHoc($lichHoc);
        $trangThai = match ($lichHoc->trang_thai) {
            'cho_xacnhan' => 'cho_xac_nhan',
            'da_nhan' => $daToiGioBatDau ? 'cho_xac_nhan' : 'sap_dien_ra',
            'hoanthanh' => 'hoan_thanh',
            'dahuy' => 'da_huy',
            default => 'sap_dien_ra',
        };

        return [
            'id' => $lichHoc->id,
            'ma' => 'LH' . str_pad((string) $lichHoc->id, 6, '0', STR_PAD_LEFT),
            'batDau' => substr((string) $lichHoc->gio_batdau, 0, 5),
            'ketThuc' => substr((string) $lichHoc->gio_ketthuc, 0, 5),
            'thu' => $this->tenThu($ngayHoc->isoWeekday()),
            'ngayHoc' => $ngayHoc->format('d/m/Y'),
            'loaiBuoi' => $lichHoc->loai_buoi === 'hoc_bu' ? 'Hoc bu' : 'Hoc thuong',
            'mon' => $goiHoc?->monHoc?->ten_mon ?? 'Mon hoc',
            'capHoc' => $goiHoc?->monHoc?->lop ?? 'Chua cap nhat',
            'hocVien' => $goiHoc?->hocVien?->ho_ten ?? 'Hoc vien',
            'hinhThuc' => $lichHoc->hinh_thuc_hoc === 'online' ? 'Trực tuyến' : 'Trực tiếp',
            'diaDiem' => $lichHoc->dia_chi_hoc ?: ($lichHoc->hinh_thuc_hoc === 'online' ? 'Online' : 'Chua cap nhat'),
            'trangThai' => $trangThai,
            'ghiChu' => $lichHoc->ghi_chu ?: 'Khong co ghi chu.',
            'daToiGioBatDau' => $daToiGioBatDau,
            'daQuaGioKetThuc' => $daQuaGioKetThuc,
            'coTheXacNhanHoanThanh' => $daToiGioBatDau
                && $lichHoc->trang_thai === 'da_nhan'
                && ! $xacNhan['giaSuDaXacNhan']
                && ! $xacNhan['giaSuBaoVanDe'],
            'xacNhan' => $xacNhan,
        ];
    }

    protected function taiLichHocAdmin(int $lichHocId): LichHoc
    {
        return LichHoc::query()
            ->with([
                'goiHoc:id,hocvien_id,giasu_id,monhoc_id,loai_goi_id,ngay_batdau,ngay_ketthuc,so_buoi,hoc_dinhky,kieu_goi,tong_tien,trang_thai',
                'goiHoc.hocVien:id,ho_ten,email,sdt',
                'goiHoc.monHoc:id,ten_mon,lop',
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

    protected function guiThongBaoXuLyLichHoc(LichHoc $lichHoc, string $tieuDe): void
    {
        $lichHoc->loadMissing(['goiHoc.hocVien:id,ho_ten', 'giasu.user:id,ho_ten']);
        $noiDung = 'Buoi hoc ngay ' . Carbon::parse($lichHoc->ngay_hoc)->format('d/m/Y')
            . ' luc ' . substr((string) $lichHoc->gio_batdau, 0, 5)
            . ' - ' . substr((string) $lichHoc->gio_ketthuc, 0, 5)
            . ' da duoc admin cap nhat.';

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
        $goiHoc = $lichHoc->goiHoc;
        $hocVien = $goiHoc?->hocVien;
        $giaSuUser = $lichHoc->giasu?->user;
        $monHoc = $goiHoc?->monHoc;
        $ngayHoc = Carbon::parse($lichHoc->ngay_hoc);
        $xacNhan = $this->thongTinXacNhanLichHoc($lichHoc);

        return [
            'id' => $lichHoc->id,
            'goiHocId' => $lichHoc->goihoc_id,
            'maGoi' => 'GH' . str_pad((string) $lichHoc->goihoc_id, 6, '0', STR_PAD_LEFT),
            'loaiBuoi' => $lichHoc->loai_buoi,
            'loaiBuoiText' => $lichHoc->loai_buoi === 'hoc_bu' ? 'Học bù' : 'Học thường',
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
            'trangThai' => $lichHoc->trang_thai,
            'trangThaiText' => $this->tenTrangThaiLichHoc($lichHoc->trang_thai),
            'ghiChu' => $lichHoc->ghi_chu,
            'lyDoHuy' => $lichHoc->lydo_huy,
            'xacNhan' => $xacNhan,
            'coTheAdminXacNhanHoanThanh' => $lichHoc->trang_thai === 'da_nhan'
                && $xacNhan['duHaiBenXacNhan']
                && ! $xacNhan['coBaoVanDe'],
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
                : $danhSachGio->count() . ' khung gio';

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

        return $cacBuoiDau . ($soBuoiConLai > 0 ? " (+{$soBuoiConLai} buoi)" : '');
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
            . ($lichHocs->count() > 3 ? ' +' . ($lichHocs->count() - 3) . ' buoi' : '');
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
        $daToiGioBatDau = now()->gte(Carbon::parse($lichHoc->ngay_hoc . ' ' . $lichHoc->gio_batdau));
        $daQuaGioKetThuc = now()->gte(Carbon::parse($lichHoc->ngay_hoc . ' ' . $lichHoc->gio_ketthuc));
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
            'coTheDanhGia' => $lichHoc->trang_thai === 'hoanthanh',
            'coTheDoiBuoi' => in_array($lichHoc->trang_thai, ['cho_xacnhan', 'da_nhan'], true)
                && ! ($yeuCauHocBuMoiNhat?->trang_thai === 'cho_duyet'),
            'danhGia' => $lichHoc->danhGia ? $this->dinhDangDanhGia($lichHoc->danhGia) : null,
            'yeuCauDoiBuoi' => $yeuCauHocBuMoiNhat ? $this->dinhDangYeuCauHocBu($yeuCauHocBuMoiNhat) : null,
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
        return [
            'id' => $yeuCau->id,
            'ngayHoc' => $yeuCau->ngay_hoc ? Carbon::parse($yeuCau->ngay_hoc)->toDateString() : null,
            'gioBatDau' => substr((string) $yeuCau->gio_batdau, 0, 5),
            'gioKetThuc' => substr((string) $yeuCau->gio_ketthuc, 0, 5),
            'lyDo' => $yeuCau->ly_do,
            'trangThai' => $yeuCau->trang_thai,
            'ngayYeuCau' => $yeuCau->ngay_yeu_cau?->format('d/m/Y H:i') ?? '',
            'ngayXuLy' => $yeuCau->ngay_xu_ly?->format('d/m/Y H:i') ?? null,
        ];
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
}

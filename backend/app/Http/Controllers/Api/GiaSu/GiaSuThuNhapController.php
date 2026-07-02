<?php

namespace App\Http\Controllers\Api\GiaSu;

use App\Http\Controllers\Controller;
use App\Models\LichHoc;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;

class GiaSuThuNhapController extends Controller
{
    public function thongKe(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'loai' => ['nullable', 'in:ngay,thang,nam'],
            'gia_tri' => ['nullable', 'string', 'max:20'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Bộ lọc thu nhập không hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        if ($user->vai_tro !== 'giasu' || ! $user->giasu) {
            return response()->json([
                'message' => 'Chức năng thu nhập chỉ dành cho tài khoản gia sư.',
            ], 403);
        }

        $loai = $request->input('loai', 'thang');
        [$tuNgay, $denNgay, $nhanThoiGian] = $this->khoangThoiGian($loai, $request->input('gia_tri'));

        $lichHocs = LichHoc::query()
            ->with(['goiHoc.hocVien', 'goiHoc.monHoc'])
            ->where('giasu_id', $user->giasu->id)
            ->where('trang_thai', 'hoanthanh')
            ->whereBetween('ngay_hoc', [$tuNgay->toDateString(), $denNgay->toDateString()])
            ->orderBy('ngay_hoc')
            ->orderBy('gio_batdau')
            ->get();

        $tongThuNhap = $lichHocs->sum(fn (LichHoc $lichHoc) => $this->tienGiaSuNhan($lichHoc));
        $soBuoi = $lichHocs->count();

        return response()->json([
            'data' => [
                'boLoc' => [
                    'loai' => $loai,
                    'giaTri' => $this->giaTriBoLoc($loai, $tuNgay),
                    'tuNgay' => $tuNgay->toDateString(),
                    'denNgay' => $denNgay->toDateString(),
                    'nhanThoiGian' => $nhanThoiGian,
                ],
                'tongQuan' => [
                    'tongThuNhap' => $tongThuNhap,
                    'soBuoiHoanThanh' => $soBuoi,
                    'trungBinhMoiBuoi' => $soBuoi > 0 ? round($tongThuNhap / $soBuoi) : 0,
                    'monThuNhapCaoNhat' => $this->monThuNhapCaoNhat($lichHocs),
                ],
                'bieuDo' => $this->duLieuBieuDo($lichHocs, $loai, $tuNgay, $denNgay),
                'chiTiet' => $lichHocs->map(fn (LichHoc $lichHoc) => $this->dinhDangChiTiet($lichHoc))->values(),
            ],
        ]);
    }

    private function khoangThoiGian(string $loai, ?string $giaTri): array
    {
        if ($loai === 'ngay') {
            $ngay = $this->parseDate($giaTri, now());

            return [$ngay->copy()->startOfDay(), $ngay->copy()->endOfDay(), $ngay->format('d/m/Y')];
        }

        if ($loai === 'nam') {
            $nam = preg_match('/^\d{4}$/', (string) $giaTri) ? (int) $giaTri : (int) now()->year;
            $ngay = Carbon::create($nam, 1, 1);

            return [$ngay->copy()->startOfYear(), $ngay->copy()->endOfYear(), (string) $nam];
        }

        $thang = preg_match('/^\d{4}-\d{2}$/', (string) $giaTri)
            ? Carbon::createFromFormat('Y-m', $giaTri)->startOfMonth()
            : now()->startOfMonth();

        return [$thang->copy()->startOfMonth(), $thang->copy()->endOfMonth(), $thang->format('m/Y')];
    }

    private function parseDate(?string $giaTri, Carbon $macDinh): Carbon
    {
        if (! preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) $giaTri)) {
            return $macDinh->copy();
        }

        return Carbon::createFromFormat('Y-m-d', $giaTri);
    }

    private function giaTriBoLoc(string $loai, Carbon $tuNgay): string
    {
        return match ($loai) {
            'ngay' => $tuNgay->format('Y-m-d'),
            'nam' => $tuNgay->format('Y'),
            default => $tuNgay->format('Y-m'),
        };
    }

    private function tienGiaSuNhan(LichHoc $lichHoc): float
    {
        $tienNhan = (float) $lichHoc->tien_giasu_nhan;

        if ($tienNhan > 0) {
            return $tienNhan;
        }

        return max((float) $lichHoc->tien_hoc - (float) $lichHoc->phi_hoahong, 0);
    }

    private function monThuNhapCaoNhat(Collection $lichHocs): ?array
    {
        $monHoc = $lichHocs
            ->groupBy(fn (LichHoc $lichHoc) => $lichHoc->goiHoc?->monHoc?->ten_mon ?? 'Chưa cập nhật')
            ->map(fn (Collection $nhom, string $tenMon) => [
                'tenMon' => $tenMon,
                'tongThuNhap' => $nhom->sum(fn (LichHoc $lichHoc) => $this->tienGiaSuNhan($lichHoc)),
                'soBuoi' => $nhom->count(),
            ])
            ->sortByDesc('tongThuNhap')
            ->first();

        return $monHoc ?: null;
    }

    private function duLieuBieuDo(Collection $lichHocs, string $loai, Carbon $tuNgay, Carbon $denNgay): array
    {
        if ($loai === 'ngay') {
            return $lichHocs
                ->map(fn (LichHoc $lichHoc) => [
                    'nhan' => substr((string) $lichHoc->gio_batdau, 0, 5),
                    'thuNhap' => $this->tienGiaSuNhan($lichHoc),
                    'soBuoi' => 1,
                ])
                ->values()
                ->all();
        }

        if ($loai === 'nam') {
            return collect(range(1, 12))
                ->map(function (int $thang) use ($lichHocs) {
                    $trongThang = $lichHocs->filter(fn (LichHoc $lichHoc) => Carbon::parse($lichHoc->ngay_hoc)->month === $thang);

                    return [
                        'nhan' => 'T' . $thang,
                        'thuNhap' => $trongThang->sum(fn (LichHoc $lichHoc) => $this->tienGiaSuNhan($lichHoc)),
                        'soBuoi' => $trongThang->count(),
                    ];
                })
                ->all();
        }

        return collect(range(0, 4))
            ->map(function (int $tuanIndex) use ($lichHocs, $tuNgay, $denNgay) {
                $batDauTuan = $tuNgay->copy()->addDays($tuanIndex * 7);

                if ($batDauTuan->gt($denNgay)) {
                    return null;
                }

                $ketThucTuan = $batDauTuan->copy()->addDays(6)->min($denNgay);
                $trongTuan = $lichHocs->filter(function (LichHoc $lichHoc) use ($batDauTuan, $ketThucTuan) {
                    $ngayHoc = Carbon::parse($lichHoc->ngay_hoc);

                    return $ngayHoc->betweenIncluded($batDauTuan, $ketThucTuan);
                });

                return [
                    'nhan' => 'Tuần ' . ($tuanIndex + 1),
                    'thuNhap' => $trongTuan->sum(fn (LichHoc $lichHoc) => $this->tienGiaSuNhan($lichHoc)),
                    'soBuoi' => $trongTuan->count(),
                    'moTa' => $batDauTuan->format('d/m') . ' - ' . $ketThucTuan->format('d/m'),
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    private function dinhDangChiTiet(LichHoc $lichHoc): array
    {
        $goiHoc = $lichHoc->goiHoc;
        $ngayHoc = Carbon::parse($lichHoc->ngay_hoc);

        return [
            'id' => $lichHoc->id,
            'ma' => 'LH' . str_pad((string) $lichHoc->id, 6, '0', STR_PAD_LEFT),
            'thoiGian' => $ngayHoc->format('d/m/Y') . ' · ' . substr((string) $lichHoc->gio_batdau, 0, 5) . ' - ' . substr((string) $lichHoc->gio_ketthuc, 0, 5),
            'hocVien' => $goiHoc?->hocVien?->ho_ten ?? 'Học viên',
            'monHoc' => trim(($goiHoc?->monHoc?->ten_mon ?? 'Môn học') . ' · ' . ($goiHoc?->monHoc?->lop ?? '')),
            'loaiBuoi' => $lichHoc->loai_buoi === 'hoc_bu' ? 'Học bù' : 'Học thường',
            'tienHoc' => (float) $lichHoc->tien_hoc,
            'phiHoaHong' => (float) $lichHoc->phi_hoahong,
            'thuNhap' => $this->tienGiaSuNhan($lichHoc),
        ];
    }
}

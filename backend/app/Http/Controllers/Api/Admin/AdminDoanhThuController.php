<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\LichHoc;
use App\Models\ThanhToan;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AdminDoanhThuController extends Controller
{
    public function tongQuan(Request $request): JsonResponse
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Ban khong co quyen truy cap.',
            ], 403);
        }

        $duLieu = $request->validate([
            'tu_ngay' => ['nullable', 'date'],
            'den_ngay' => ['nullable', 'date'],
        ]);

        $tuNgay = filled($duLieu['tu_ngay'] ?? null) ? Carbon::parse($duLieu['tu_ngay'])->startOfDay() : null;
        $denNgay = filled($duLieu['den_ngay'] ?? null) ? Carbon::parse($duLieu['den_ngay'])->endOfDay() : null;

        $thanhToanTheoBoLoc = ThanhToan::query()
            ->when($tuNgay, fn ($query) => $query->where('ngay_thanhtoan', '>=', $tuNgay))
            ->when($denNgay, fn ($query) => $query->where('ngay_thanhtoan', '<=', $denNgay));

        $daThanhToanTheoBoLoc = (clone $thanhToanTheoBoLoc)->where('trang_thai', 'da_thanhtoan');
        $dauThang = now()->startOfMonth();
        $cuoiThang = now()->endOfMonth();
        $goiHocDaThanhToanIds = (clone $daThanhToanTheoBoLoc)
            ->pluck('goihoc_id')
            ->unique()
            ->values();
        $taiChinhTheoBoLoc = $this->tongTaiChinhTheoGoi($goiHocDaThanhToanIds);
        $doanhSoTheoBoLoc = (float) (clone $daThanhToanTheoBoLoc)->sum('so_tien');
        $thanhToanThangNay = ThanhToan::query()
            ->where('trang_thai', 'da_thanhtoan')
            ->whereBetween('ngay_thanhtoan', [$dauThang, $cuoiThang]);
        $taiChinhThangNay = $this->tongTaiChinhTheoGoi(
            (clone $thanhToanThangNay)->pluck('goihoc_id')->unique()->values()
        );

        $doanhThuTheoThang = (clone $daThanhToanTheoBoLoc)
            ->selectRaw("DATE_FORMAT(ngay_thanhtoan, '%Y-%m') as thang")
            ->selectRaw('SUM(so_tien) as tong_tien')
            ->selectRaw('COUNT(*) as so_giao_dich')
            ->groupBy('thang')
            ->orderBy('thang')
            ->get()
            ->map(function ($item) use ($daThanhToanTheoBoLoc) {
                $taiChinh = $this->tongTaiChinhTheoGoi(
                    (clone $daThanhToanTheoBoLoc)
                        ->whereRaw("DATE_FORMAT(ngay_thanhtoan, '%Y-%m') = ?", [$item->thang])
                        ->pluck('goihoc_id')
                        ->unique()
                        ->values()
                );

                return [
                    'thang' => $item->thang,
                    'nhan' => Carbon::createFromFormat('Y-m', $item->thang)->format('m/Y'),
                    'tongTien' => $taiChinh['hoaHong'],
                    'doanhSo' => (float) $item->tong_tien,
                    'giaSuNhan' => $taiChinh['giaSuNhan'],
                    'soGiaoDich' => (int) $item->so_giao_dich,
                ];
            })
            ->values();

        $doanhThuTheoPhuongThuc = (clone $daThanhToanTheoBoLoc)
            ->select('phuong_thuc')
            ->selectRaw('COUNT(*) as so_giao_dich')
            ->groupBy('phuong_thuc')
            ->get()
            ->map(function (ThanhToan $item) use ($daThanhToanTheoBoLoc) {
                $thanhToanTheoPhuongThuc = (clone $daThanhToanTheoBoLoc)
                    ->where('phuong_thuc', $item->phuong_thuc);
                $taiChinh = $this->tongTaiChinhTheoGoi(
                    (clone $thanhToanTheoPhuongThuc)->pluck('goihoc_id')->unique()->values()
                );

                return [
                    'phuongThuc' => $item->phuong_thuc,
                    'nhan' => $this->tenPhuongThuc($item->phuong_thuc),
                    'tongTien' => $taiChinh['hoaHong'],
                    'doanhSo' => (float) (clone $thanhToanTheoPhuongThuc)->sum('so_tien'),
                    'giaSuNhan' => $taiChinh['giaSuNhan'],
                    'soGiaoDich' => (int) $item->so_giao_dich,
                ];
            })
            ->sortByDesc('tongTien')
            ->values();

        $giaoDichGanDay = (clone $thanhToanTheoBoLoc)
            ->with([
                'goiHoc:id,hocvien_id,giasu_id,monhoc_id,loai_goi_id,trang_thai,tong_tien',
                'goiHoc.hocVien:id,ho_ten,email,sdt',
                'goiHoc.giasu:id,user_id',
                'goiHoc.giasu.user:id,ho_ten,email,sdt',
                'goiHoc.monHoc:id,ten_mon,lop',
                'goiHoc.loaiGoi:id,ten_loai_goi',
            ])
            ->orderByDesc(DB::raw('COALESCE(ngay_thanhtoan, created_at)'))
            ->limit(20)
            ->get()
            ->map(fn (ThanhToan $thanhToan) => $this->dinhDangThanhToan($thanhToan))
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'boLoc' => [
                    'tuNgay' => $tuNgay?->toDateString(),
                    'denNgay' => $denNgay?->toDateString(),
                ],
                'tongQuan' => [
                    'doanhSo' => $doanhSoTheoBoLoc,
                    'tongDoanhThu' => $taiChinhTheoBoLoc['hoaHong'],
                    'hoaHongHeThong' => $taiChinhTheoBoLoc['hoaHong'],
                    'giaSuNhan' => $taiChinhTheoBoLoc['giaSuNhan'],
                    'doanhSoThangNay' => (float) (clone $thanhToanThangNay)->sum('so_tien'),
                    'doanhThuThangNay' => $taiChinhThangNay['hoaHong'],
                    'giaSuNhanThangNay' => $taiChinhThangNay['giaSuNhan'],
                    'soGiaoDichThanhCong' => (int) (clone $daThanhToanTheoBoLoc)->count(),
                    'soGiaoDichChoDuyet' => (int) (clone $thanhToanTheoBoLoc)->where('trang_thai', 'cho_thanhtoan')->count(),
                    'soGiaoDichThatBai' => (int) (clone $thanhToanTheoBoLoc)->where('trang_thai', 'that_bai')->count(),
                    'giaTriTrungBinh' => (float) ((clone $daThanhToanTheoBoLoc)->avg('so_tien') ?? 0),
                ],
                'theoThang' => $doanhThuTheoThang,
                'theoPhuongThuc' => $doanhThuTheoPhuongThuc,
                'bieuDo' => $this->bieuDoDoanhThu(),
                'giaoDichGanDay' => $giaoDichGanDay,
            ],
        ]);
    }

    private function bieuDoDoanhThu(): array
    {
        return [
            'ngay' => $this->bieuDoTheoNgay(),
            'thang' => $this->bieuDoTheoThang(),
            'nam' => $this->bieuDoTheoNam(),
        ];
    }

    private function tongTaiChinhTheoGoi(Collection $goiHocIds): array
    {
        if ($goiHocIds->isEmpty()) {
            return [
                'hoaHong' => 0.0,
                'giaSuNhan' => 0.0,
            ];
        }

        $lichHoc = LichHoc::query()
            ->whereIn('goihoc_id', $goiHocIds)
            ->where('trang_thai', '!=', 'dahuy');

        return [
            'hoaHong' => (float) (clone $lichHoc)->sum('phi_hoahong'),
            'giaSuNhan' => (float) (clone $lichHoc)->sum('tien_giasu_nhan'),
        ];
    }

    private function tongTaiChinhTuThanhToan($thanhToanQuery): array
    {
        $goiHocIds = (clone $thanhToanQuery)
            ->pluck('goihoc_id')
            ->unique()
            ->values();
        $taiChinh = $this->tongTaiChinhTheoGoi($goiHocIds);

        return [
            'doanhSo' => (float) (clone $thanhToanQuery)->sum('so_tien'),
            'hoaHong' => $taiChinh['hoaHong'],
            'giaSuNhan' => $taiChinh['giaSuNhan'],
            'soGiaoDich' => (int) (clone $thanhToanQuery)->count(),
        ];
    }

    private function bieuDoTheoNgay(): array
    {
        $denNgay = Carbon::today();
        $tuNgay = $denNgay->copy()->subDays(29);

        $duLieu = ThanhToan::query()
            ->where('trang_thai', 'da_thanhtoan')
            ->whereBetween('ngay_thanhtoan', [$tuNgay->copy()->startOfDay(), $denNgay->copy()->endOfDay()])
            ->selectRaw('DATE(ngay_thanhtoan) as moc')
            ->selectRaw('COUNT(*) as so_giao_dich')
            ->groupByRaw('DATE(ngay_thanhtoan)')
            ->get()
            ->keyBy('moc');

        return collect(range(0, 29))
            ->map(function (int $index) use ($tuNgay, $duLieu) {
                $ngay = $tuNgay->copy()->addDays($index);
                $moc = $ngay->toDateString();
                $item = $duLieu->get($moc);
                $taiChinh = $this->tongTaiChinhTuThanhToan(
                    ThanhToan::query()
                        ->where('trang_thai', 'da_thanhtoan')
                        ->whereBetween('ngay_thanhtoan', [$ngay->copy()->startOfDay(), $ngay->copy()->endOfDay()])
                );

                return [
                    'moc' => $moc,
                    'nhan' => $ngay->format('d/m'),
                    'tongTien' => $taiChinh['hoaHong'],
                    'doanhSo' => $taiChinh['doanhSo'],
                    'giaSuNhan' => $taiChinh['giaSuNhan'],
                    'soGiaoDich' => (int) ($item?->so_giao_dich ?? 0),
                ];
            })
            ->values()
            ->all();
    }

    private function bieuDoTheoThang(): array
    {
        $denThang = Carbon::today()->endOfMonth();
        $tuThang = $denThang->copy()->subMonths(11)->startOfMonth();

        $duLieu = ThanhToan::query()
            ->where('trang_thai', 'da_thanhtoan')
            ->whereBetween('ngay_thanhtoan', [$tuThang, $denThang])
            ->selectRaw("DATE_FORMAT(ngay_thanhtoan, '%Y-%m') as moc")
            ->selectRaw('COUNT(*) as so_giao_dich')
            ->groupByRaw("DATE_FORMAT(ngay_thanhtoan, '%Y-%m')")
            ->get()
            ->keyBy('moc');

        return collect(range(0, 11))
            ->map(function (int $index) use ($tuThang, $duLieu) {
                $thang = $tuThang->copy()->addMonths($index);
                $moc = $thang->format('Y-m');
                $item = $duLieu->get($moc);
                $taiChinh = $this->tongTaiChinhTuThanhToan(
                    ThanhToan::query()
                        ->where('trang_thai', 'da_thanhtoan')
                        ->whereBetween('ngay_thanhtoan', [$thang->copy()->startOfMonth(), $thang->copy()->endOfMonth()])
                );

                return [
                    'moc' => $moc,
                    'nhan' => $thang->format('m/Y'),
                    'tongTien' => $taiChinh['hoaHong'],
                    'doanhSo' => $taiChinh['doanhSo'],
                    'giaSuNhan' => $taiChinh['giaSuNhan'],
                    'soGiaoDich' => (int) ($item?->so_giao_dich ?? 0),
                ];
            })
            ->values()
            ->all();
    }

    private function bieuDoTheoNam(): array
    {
        $namHienTai = (int) Carbon::today()->format('Y');
        $tuNam = $namHienTai - 4;

        $duLieu = ThanhToan::query()
            ->where('trang_thai', 'da_thanhtoan')
            ->whereYear('ngay_thanhtoan', '>=', $tuNam)
            ->whereYear('ngay_thanhtoan', '<=', $namHienTai)
            ->selectRaw('YEAR(ngay_thanhtoan) as moc')
            ->selectRaw('COUNT(*) as so_giao_dich')
            ->groupByRaw('YEAR(ngay_thanhtoan)')
            ->get()
            ->keyBy('moc');

        return collect(range($tuNam, $namHienTai))
            ->map(function (int $nam) use ($duLieu) {
                $item = $duLieu->get($nam);
                $taiChinh = $this->tongTaiChinhTuThanhToan(
                    ThanhToan::query()
                        ->where('trang_thai', 'da_thanhtoan')
                        ->whereYear('ngay_thanhtoan', $nam)
                );

                return [
                    'moc' => (string) $nam,
                    'nhan' => (string) $nam,
                    'tongTien' => $taiChinh['hoaHong'],
                    'doanhSo' => $taiChinh['doanhSo'],
                    'giaSuNhan' => $taiChinh['giaSuNhan'],
                    'soGiaoDich' => (int) ($item?->so_giao_dich ?? 0),
                ];
            })
            ->values()
            ->all();
    }

    private function dinhDangThanhToan(ThanhToan $thanhToan): array
    {
        $goiHoc = $thanhToan->goiHoc;
        $monHoc = $goiHoc?->monHoc;

        return [
            'id' => $thanhToan->id,
            'maGoi' => $goiHoc ? 'GH' . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT) : 'Chưa cập nhật',
            'soTien' => (float) $thanhToan->so_tien,
            'phuongThuc' => $thanhToan->phuong_thuc,
            'phuongThucText' => $this->tenPhuongThuc($thanhToan->phuong_thuc),
            'maGiaoDich' => $thanhToan->ma_giaodich,
            'trangThai' => $thanhToan->trang_thai,
            'trangThaiText' => $this->tenTrangThai($thanhToan->trang_thai),
            'ngayThanhToan' => $thanhToan->ngay_thanhtoan?->format('d/m/Y H:i') ?? '',
            'hocVien' => [
                'hoTen' => $goiHoc?->hocVien?->ho_ten,
                'email' => $goiHoc?->hocVien?->email,
                'sdt' => $goiHoc?->hocVien?->sdt,
            ],
            'giaSu' => [
                'hoTen' => $goiHoc?->giasu?->user?->ho_ten,
                'email' => $goiHoc?->giasu?->user?->email,
                'sdt' => $goiHoc?->giasu?->user?->sdt,
            ],
            'goiHoc' => [
                'loaiGoi' => $goiHoc?->loaiGoi?->ten_loai_goi,
                'monHoc' => $monHoc
                    ? trim($monHoc->ten_mon . ($monHoc->lop ? ' - ' . $this->dinhDangLop($monHoc->lop) : ''))
                    : null,
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

    private function tenPhuongThuc(?string $phuongThuc): string
    {
        return [
            'tienmat' => 'Tiền mặt',
            'momo' => 'MoMo',
            'zalopay' => 'ZaloPay',
            'banking' => 'Chuyển khoản',
        ][$phuongThuc] ?? 'Chưa cập nhật';
    }

    private function tenTrangThai(?string $trangThai): string
    {
        return [
            'cho_thanhtoan' => 'Chờ duyệt',
            'da_thanhtoan' => 'Đã thanh toán',
            'that_bai' => 'Thất bại',
        ][$trangThai] ?? 'Chưa cập nhật';
    }
}

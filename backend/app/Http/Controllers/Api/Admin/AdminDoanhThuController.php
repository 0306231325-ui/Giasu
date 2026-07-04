<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ThanhToan;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

        $doanhThuTheoThang = (clone $daThanhToanTheoBoLoc)
            ->selectRaw("DATE_FORMAT(ngay_thanhtoan, '%Y-%m') as thang")
            ->selectRaw('SUM(so_tien) as tong_tien')
            ->selectRaw('COUNT(*) as so_giao_dich')
            ->groupBy('thang')
            ->orderBy('thang')
            ->get()
            ->map(fn ($item) => [
                'thang' => $item->thang,
                'nhan' => Carbon::createFromFormat('Y-m', $item->thang)->format('m/Y'),
                'tongTien' => (float) $item->tong_tien,
                'soGiaoDich' => (int) $item->so_giao_dich,
            ])
            ->values();

        $doanhThuTheoPhuongThuc = (clone $daThanhToanTheoBoLoc)
            ->select('phuong_thuc')
            ->selectRaw('SUM(so_tien) as tong_tien')
            ->selectRaw('COUNT(*) as so_giao_dich')
            ->groupBy('phuong_thuc')
            ->orderByDesc('tong_tien')
            ->get()
            ->map(fn (ThanhToan $item) => [
                'phuongThuc' => $item->phuong_thuc,
                'nhan' => $this->tenPhuongThuc($item->phuong_thuc),
                'tongTien' => (float) $item->tong_tien,
                'soGiaoDich' => (int) $item->so_giao_dich,
            ])
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
                    'tongDoanhThu' => (float) (clone $daThanhToanTheoBoLoc)->sum('so_tien'),
                    'doanhThuThangNay' => (float) ThanhToan::query()
                        ->where('trang_thai', 'da_thanhtoan')
                        ->whereBetween('ngay_thanhtoan', [$dauThang, $cuoiThang])
                        ->sum('so_tien'),
                    'soGiaoDichThanhCong' => (int) (clone $daThanhToanTheoBoLoc)->count(),
                    'soGiaoDichChoDuyet' => (int) (clone $thanhToanTheoBoLoc)->where('trang_thai', 'cho_thanhtoan')->count(),
                    'soGiaoDichThatBai' => (int) (clone $thanhToanTheoBoLoc)->where('trang_thai', 'that_bai')->count(),
                    'giaTriTrungBinh' => (float) ((clone $daThanhToanTheoBoLoc)->avg('so_tien') ?? 0),
                ],
                'theoThang' => $doanhThuTheoThang,
                'theoPhuongThuc' => $doanhThuTheoPhuongThuc,
                'giaoDichGanDay' => $giaoDichGanDay,
            ],
        ]);
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

<?php

namespace App\Http\Controllers\Api\GiaSu;

use App\Http\Controllers\Controller;
use App\Models\DanhGia;
use App\Models\LichHoc;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;

class GiaSuTheoDoiHoatDongController extends Controller
{
    public function thongKe(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'thoi_gian' => ['nullable', 'in:tat_ca,7_ngay,30_ngay,nam_nay'],
            'so_sao' => ['nullable', 'in:5,4,3,duoi_3'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Bộ lọc theo dõi hoạt động không hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        if ($user->vai_tro !== 'giasu' || ! $user->giasu) {
            return response()->json([
                'message' => 'Chức năng theo dõi hoạt động chỉ dành cho tài khoản gia sư.',
            ], 403);
        }

        $query = DanhGia::query()
            ->with([
                'user:id,ho_ten,email',
                'lichHoc:id,goihoc_id,giasu_id,ngay_hoc,gio_batdau,gio_ketthuc,trang_thai',
                'lichHoc.goiHoc:id,hocvien_id,monhoc_id',
                'lichHoc.goiHoc.hocVien:id,ho_ten,email',
                'lichHoc.goiHoc.monHoc:id,ten_mon,lop',
            ])
            ->whereHas('lichHoc', fn ($lichHoc) => $lichHoc->where('giasu_id', $user->giasu->id));

        $this->apDungLocThoiGian($query, $request->input('thoi_gian', 'tat_ca'));
        $this->apDungLocSoSao($query, $request->input('so_sao'));

        $danhGias = $query
            ->latest('updated_at')
            ->get();

        return response()->json([
            'data' => [
                'tongQuan' => $this->tongQuan($danhGias),
                'phanBoDanhGia' => $this->phanBoDanhGia($danhGias),
                'danhSach' => $danhGias
                    ->map(fn (DanhGia $danhGia) => $this->dinhDangDanhGia($danhGia))
                    ->values(),
            ],
        ]);
    }

    private function apDungLocThoiGian(Builder $query, string $thoiGian): void
    {
        match ($thoiGian) {
            '7_ngay' => $query->where('updated_at', '>=', now()->subDays(7)->startOfDay()),
            '30_ngay' => $query->where('updated_at', '>=', now()->subDays(30)->startOfDay()),
            'nam_nay' => $query->where('updated_at', '>=', now()->startOfYear()),
            default => null,
        };
    }

    private function apDungLocSoSao(Builder $query, ?string $soSao): void
    {
        if (! $soSao) {
            return;
        }

        if ($soSao === 'duoi_3') {
            $query->where('so_sao', '<', 3);

            return;
        }

        $query->where('so_sao', (int) $soSao);
    }

    private function tongQuan(Collection $danhGias): array
    {
        $tong = $danhGias->count();
        $diemTrungBinh = $tong > 0 ? round((float) $danhGias->avg('so_sao'), 1) : 0;
        $tichCuc = $danhGias->where('so_sao', '>=', 4)->count();
        $tieuCuc = $danhGias->where('so_sao', '<', 4)->count();

        return [
            'diemTrungBinh' => $diemTrungBinh,
            'tongPhanHoi' => $tong,
            'danhGiaTichCuc' => $tichCuc,
            'danhGiaTieuCuc' => $tieuCuc,
        ];
    }

    private function phanBoDanhGia(Collection $danhGias): array
    {
        return collect([5, 4, 3, 2, 1])
            ->map(fn (int $soSao) => [
                'soSao' => $soSao,
                'soLuong' => $danhGias->where('so_sao', $soSao)->count(),
            ])
            ->values()
            ->all();
    }

    private function dinhDangDanhGia(DanhGia $danhGia): array
    {
        $lichHoc = $danhGia->lichHoc;
        $goiHoc = $lichHoc?->goiHoc;
        $ngayHoc = $lichHoc?->ngay_hoc ? Carbon::parse($lichHoc->ngay_hoc) : null;

        return [
            'id' => $danhGia->id,
            'maBuoiHoc' => $lichHoc ? 'LH' . str_pad((string) $lichHoc->id, 6, '0', STR_PAD_LEFT) : 'LH000000',
            'thoiGian' => $ngayHoc
                ? $ngayHoc->format('d/m/Y') . ' · ' . substr((string) $lichHoc->gio_batdau, 0, 5) . ' - ' . substr((string) $lichHoc->gio_ketthuc, 0, 5)
                : 'Chưa cập nhật',
            'hocVien' => $goiHoc?->hocVien?->ho_ten ?? $danhGia->user?->ho_ten ?? 'Học viên',
            'monHoc' => trim(($goiHoc?->monHoc?->ten_mon ?? 'Môn học') . ' · ' . ($goiHoc?->monHoc?->lop ?? '')),
            'soSao' => (int) $danhGia->so_sao,
            'noiDung' => $danhGia->noi_dung,
            'ngayDanhGia' => $danhGia->updated_at?->format('d/m/Y H:i') ?? '',
        ];
    }
}

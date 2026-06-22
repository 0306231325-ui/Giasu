<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DanhGia;
use App\Models\Giasu;
use App\Models\GiasuGia;
use Illuminate\Http\Request;

class AdminGiaSuController extends Controller
{
    public function danhSachGiaSu(Request $request)
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền truy cập.',
            ], 403);
        }

        $danhSach = Giasu::query()
            ->where('trang_thai_ho_so', 'duyet')
            ->with([
                'user:id,ho_ten,email,sdt,trang_thai',
                'trinhDo:id,ten',
                'mucKinhNghiem:id,tu_khoang,den_khoang',
                'giasuGias' => function ($query) {
                    $query
                        ->where('trang_thai', GiasuGia::TRANG_THAI_DA_DUYET)
                        ->with('monHoc:id,ten_mon');
                },
            ])
            ->addSelect([
                'diem_danh_gia' => DanhGia::query()
                    ->selectRaw('AVG(danhgia.so_sao)')
                    ->join('lichhoc', 'lichhoc.id', '=', 'danhgia.lichhoc_id')
                    ->whereColumn('lichhoc.giasu_id', 'giasu.id'),
                'so_danh_gia' => DanhGia::query()
                    ->selectRaw('COUNT(*)')
                    ->join('lichhoc', 'lichhoc.id', '=', 'danhgia.lichhoc_id')
                    ->whereColumn('lichhoc.giasu_id', 'giasu.id'),
            ])
            ->orderByDesc('duyet_luc')
            ->orderByDesc('id')
            ->get()
            ->map(function (Giasu $giaSu) {
                $mucKinhNghiem = $giaSu->mucKinhNghiem;
                $monDay = $giaSu->giasuGias
                    ->pluck('monHoc.ten_mon')
                    ->filter()
                    ->unique()
                    ->values();

                return [
                    'id' => $giaSu->id,
                    'hoTen' => $giaSu->user?->ho_ten ?? 'Chưa cập nhật',
                    'email' => $giaSu->user?->email ?? 'Chưa cập nhật',
                    'sdt' => $giaSu->user?->sdt ?? 'Chưa cập nhật',
                    'trinhDo' => $giaSu->trinhDo?->ten ?? 'Chưa cập nhật',
                    'kinhNghiem' => $this->dinhDangKinhNghiem(
                        $mucKinhNghiem?->tu_khoang,
                        $mucKinhNghiem?->den_khoang,
                    ),
                    'monDay' => $monDay,
                    'soMon' => $monDay->count(),
                    'danhGia' => round((float) ($giaSu->diem_danh_gia ?? 0), 1),
                    'soDanhGia' => (int) ($giaSu->so_danh_gia ?? 0),
                    'ngayDuyet' => $giaSu->duyet_luc
                        ? date('d/m/Y', strtotime($giaSu->duyet_luc))
                        : 'Chưa cập nhật',
                    'trangThai' => $giaSu->user?->trang_thai ?? 'khoa',
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách gia sư thành công.',
            'data' => $danhSach,
        ]);
    }

    private function dinhDangKinhNghiem(?int $tuKhoang, ?int $denKhoang): string
    {
        if ($tuKhoang === null) {
            return 'Chưa cập nhật';
        }

        if ($denKhoang === null) {
            return "Từ {$tuKhoang} năm kinh nghiệm";
        }

        if ($tuKhoang === $denKhoang) {
            return "{$tuKhoang} năm kinh nghiệm";
        }

        return "{$tuKhoang} - {$denKhoang} năm kinh nghiệm";
    }
}

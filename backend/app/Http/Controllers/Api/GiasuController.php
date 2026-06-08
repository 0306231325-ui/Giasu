<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DanhGia;
use App\Models\Giasu;

class GiasuController extends Controller
{
    public function index()
    {
        try {

            $danhSachGiaSu = Giasu::with([
                                        'user:id,ho_ten,anh_dai_dien,sdt',
                                    ])
                                    ->withCount([
                                        'lichHocs as danh_gias_count' => function ($query) {
                                            $query->whereHas('danhGia');
                                        },
                                    ])
                                    ->withMin('giasuGias as gia_tu', 'tong_gia')
                                    ->withMax('giasuGias as gia_den', 'tong_gia')
                                    ->addSelect([
                                        'danh_gias_avg_so_sao' => DanhGia::selectRaw('coalesce(avg(danhgia.so_sao), 0)')
                                            ->join('lichhoc', 'lichhoc.id', '=', 'danhgia.lichhoc_id')
                                            ->join('goihoc', 'goihoc.id', '=', 'lichhoc.goihoc_id')
                                            ->whereColumn('goihoc.giasu_id', 'giasu.id')
                                            ->limit(1),
                                    ])
                                    ->orderBy('id', 'desc')
                                    ->paginate(12);

            return response()->json([
                'success' => true,
                'message' => 'Lấy danh sách gia sư thành công',
                'data' => $danhSachGiaSu
            ], 200);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage()
            ], 500);

        }
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CapHoc;
use App\Models\MonHoc;
use App\Models\MucKinhNghiem;
use App\Models\TrinhDoGiasu;
use Illuminate\Http\JsonResponse;

class DangKyGiaSuController extends Controller
{
    public function danhMuc(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'trinh_do' => TrinhDoGiasu::query()
                    ->select('id', 'ten')
                    ->orderBy('thu_tu')
                    ->get(),
                'cap_hoc' => CapHoc::query()
                    ->select('id', 'ten')
                    ->orderBy('thu_tu')
                    ->get(),
                'mon_hoc' => MonHoc::query()
                    ->select('ten_mon', 'cap_hoc_id')
                    ->selectRaw('MIN(id) as id')
                    ->groupBy('cap_hoc_id', 'ten_mon')
                    ->orderBy('ten_mon')
                    ->get(),
                'muc_kinh_nghiem' => MucKinhNghiem::query()
                    ->select('id', 'tu_khoang', 'den_khoang')
                    ->orderBy('tu_khoang')
                    ->get(),
            ],
        ]);
    }
}

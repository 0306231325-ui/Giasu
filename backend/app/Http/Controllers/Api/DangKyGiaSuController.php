<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CapHoc;
use App\Models\MonHoc;
use App\Models\MucKinhNghiem;
use App\Models\TrinhDoGiasu;
use App\Services\GiaTinhService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DangKyGiaSuController extends Controller
{
    public function danhMuc(): JsonResponse
    {
        $monHocIds = MonHoc::query()
            ->selectRaw('MIN(id)')
            ->groupBy('cap_hoc_id', 'ten_mon');

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
                    ->select('id', 'ten_mon', 'cap_hoc_id')
                    ->whereIn('id', $monHocIds)
                    ->orderBy('ten_mon')
                    ->get(),
                'muc_kinh_nghiem' => MucKinhNghiem::query()
                    ->select('id', 'tu_khoang', 'den_khoang')
                    ->orderBy('tu_khoang')
                    ->get(),
            ],
        ]);
    }

    public function tinhGia(Request $request): JsonResponse
    {
        $duLieu = $request->validate([
            'mon_hoc_ids' => ['required', 'array', 'min:1'],
            'mon_hoc_ids.*' => ['integer', 'distinct', 'exists:monhoc,id'],
            'trinh_do_giasu_id' => ['required', 'integer', 'exists:trinh_do_giasu,id'],
            'muc_kinh_nghiem_id' => ['required', 'integer', 'exists:muc_kinh_nghiem,id'],
        ]);

        return response()->json([
            'success' => true,
            'data' => GiaTinhService::tinhGiaDuKien(
                $duLieu['mon_hoc_ids'],
                $duLieu['trinh_do_giasu_id'],
                $duLieu['muc_kinh_nghiem_id'],
            ),
        ]);
    }
}

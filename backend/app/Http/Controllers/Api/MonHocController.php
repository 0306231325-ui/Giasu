<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MonHoc;
use Illuminate\Support\Facades\DB;

class MonHocController extends Controller
{
    public function index()
    {
        try {
            $danhSachMonHoc = MonHoc::query()
                ->select('ten_mon')
                ->selectRaw('MIN(id) as id')
                ->selectRaw('MAX(mo_ta) as mo_ta')
                ->groupBy('ten_mon')
                ->orderBy('ten_mon')
                ->get()
                ->map(function ($mon) {
                    $mon->giasus_count = DB::table('giasu_gia')
                        ->join('monhoc', 'monhoc.id', '=', 'giasu_gia.monhoc_id')
                        ->where('monhoc.ten_mon', $mon->ten_mon)
                        ->distinct('giasu_gia.giasu_id')
                        ->count('giasu_gia.giasu_id');

                    return $mon;
                });

            return response()->json([
                'success' => true,
                'message' => 'Lấy danh sách môn học thành công',
                'data' => $danhSachMonHoc,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage(),
            ], 500);
        }
    }
}

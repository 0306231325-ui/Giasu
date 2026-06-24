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
                ->with('capHoc:id,ten,thu_tu')
                ->select('id', 'ten_mon', 'mo_ta', 'cap_hoc_id', 'lop')
                ->orderBy('cap_hoc_id')
                ->orderBy('lop')
                ->orderBy('ten_mon')
                ->get()
                ->map(function ($mon) {
                    $mon->giasus_count = DB::table('giasu_gia')
                        ->where('monhoc_id', $mon->id)
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

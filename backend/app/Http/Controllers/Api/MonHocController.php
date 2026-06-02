<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MonHoc;

class MonHocController extends Controller
{
    public function index()
    {
        try {
            $danhSachMonHoc = MonHoc::withCount([
                'giasuMonLops as giasus_count' => function ($q) {
                    $q->select(\DB::raw('count(distinct giasu_id)'));
                },
            ])
                ->orderBy('ten_mon')
                ->get();

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

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminHocVienController extends Controller
{
    public function danhSachHocVien(Request $request)
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền truy cập.',
            ], 403);
        }

        $keyword = trim((string) $request->query('q', ''));
        $status = $request->query('trang_thai');
        $perPage = min(max((int) $request->query('per_page', 10), 1), 50);

        $hocVien = User::query()
            ->with('hocvien')
            ->where('vai_tro', 'hocvien')
            ->when($keyword !== '', function ($query) use ($keyword) {
                $query->where(function ($subQuery) use ($keyword) {
                    $subQuery
                        ->where('ho_ten', 'like', "%{$keyword}%")
                        ->orWhere('email', 'like', "%{$keyword}%")
                        ->orWhere('sdt', 'like', "%{$keyword}%");
                });
            })
            ->when(in_array($status, ['hoatdong', 'khoa'], true), function ($query) use ($status) {
                $query->where('trang_thai', $status);
            })
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách học viên thành công',
            'data' => $hocVien,
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminHocVienController extends Controller
{
    private const SO_TAI_KHOAN_MOI_TRANG = 10;

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
            ->paginate(self::SO_TAI_KHOAN_MOI_TRANG)
            ->withQueryString();

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách học viên thành công',
            'data' => $hocVien,
        ]);
    }

    public function capNhatTrangThaiHocVien(Request $request, int $hocVienId)
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền truy cập.',
            ], 403);
        }

        $duLieu = $request->validate([
            'trang_thai' => ['required', 'in:hoatdong,khoa'],
        ]);

        $hocVien = User::query()
            ->with('hocvien')
            ->where('vai_tro', 'hocvien')
            ->find($hocVienId);

        if (! $hocVien) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy tài khoản học viên.',
            ], 404);
        }

        $hocVien->trang_thai = $duLieu['trang_thai'];
        $hocVien->save();

        if ($hocVien->trang_thai === 'khoa') {
            $hocVien->tokens()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => $hocVien->trang_thai === 'khoa'
                ? 'Đã khóa tài khoản học viên.'
                : 'Đã mở khóa tài khoản học viên.',
            'data' => $hocVien->fresh('hocvien'),
        ]);
    }
}

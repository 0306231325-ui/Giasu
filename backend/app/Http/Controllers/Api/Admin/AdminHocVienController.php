<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\NhatKyHeThongService;
use Illuminate\Http\Request;

class AdminHocVienController extends Controller
{
    private const SO_TAI_KHOAN_MOI_TRANG = 5;

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
            'ly_do_khoa' => ['required_if:trang_thai,khoa', 'nullable', 'string', 'min:3', 'max:1000'],
        ], [
            'ly_do_khoa.required_if' => 'Vui lòng nhập lý do khóa tài khoản.',
            'ly_do_khoa.min' => 'Lý do khóa tài khoản phải có ít nhất 3 ký tự.',
            'ly_do_khoa.max' => 'Lý do khóa tài khoản không được vượt quá 1000 ký tự.',
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
        $hocVien->ly_do_khoa = $hocVien->trang_thai === 'khoa'
            ? trim((string) $duLieu['ly_do_khoa'])
            : null;
        $hocVien->save();

        $laKhoaTaiKhoan = $hocVien->trang_thai === 'khoa';

        NhatKyHeThongService::ghi(
            $request->user(),
            $laKhoaTaiKhoan ? 'khoa_tai_khoan' : 'mo_khoa_tai_khoan',
            $hocVien->id,
            $laKhoaTaiKhoan
                ? "Admin khóa tài khoản học viên {$hocVien->ho_ten}. Lý do: {$hocVien->ly_do_khoa}"
                : "Admin mở khóa tài khoản học viên {$hocVien->ho_ten}."
        );

        return response()->json([
            'success' => true,
            'message' => $laKhoaTaiKhoan
                ? 'Đã khóa tài khoản học viên.'
                : 'Đã mở khóa tài khoản học viên.',
            'data' => $hocVien->fresh('hocvien'),
        ]);
    }
}

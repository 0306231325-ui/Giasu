<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Giasu;
use App\Models\GiasuGia;
use App\Services\NhatKyHeThongService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminTrangThaiGiaSuController extends Controller
{
    public function capNhatTrangThaiGiaSu(Request $request, int $giaSuId): JsonResponse
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

        $giaSu = Giasu::query()
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
            ->find($giaSuId);

        if (! $giaSu || ! $giaSu->user) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy tài khoản gia sư.',
            ], 404);
        }

        $giaSu->user->trang_thai = $duLieu['trang_thai'];
        $giaSu->user->ly_do_khoa = $giaSu->user->trang_thai === 'khoa'
            ? trim((string) $duLieu['ly_do_khoa'])
            : null;
        $giaSu->user->save();

        $giaSu->setRelation('user', $giaSu->user->fresh());

        $laKhoaTaiKhoan = $giaSu->user->trang_thai === 'khoa';

        NhatKyHeThongService::ghi(
            $request->user(),
            $laKhoaTaiKhoan ? 'khoa_tai_khoan' : 'mo_khoa_tai_khoan',
            $giaSu->user->id,
            $laKhoaTaiKhoan
                ? "Admin khóa tài khoản gia sư {$giaSu->user->ho_ten}. Lý do: {$giaSu->user->ly_do_khoa}"
                : "Admin mở khóa tài khoản gia sư {$giaSu->user->ho_ten}."
        );

        return response()->json([
            'success' => true,
            'message' => $laKhoaTaiKhoan
                ? 'Đã khóa tài khoản gia sư.'
                : 'Đã mở khóa tài khoản gia sư.',
            'data' => [
                'id' => $giaSu->id,
                'trangThai' => $giaSu->user->trang_thai,
                'lyDoKhoa' => $giaSu->user->ly_do_khoa,
            ],
        ]);
    }
}

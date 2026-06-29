<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Giasu;
use App\Models\GiasuGia;
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
        $giaSu->user->save();

        if ($giaSu->user->trang_thai === 'khoa') {
            $giaSu->user->tokens()->delete();
        }

        $giaSu->setRelation('user', $giaSu->user->fresh());

        return response()->json([
            'success' => true,
            'message' => $giaSu->user->trang_thai === 'khoa'
                ? 'Đã khóa tài khoản gia sư.'
                : 'Đã mở khóa tài khoản gia sư.',
            'data' => [
                'id' => $giaSu->id,
                'trangThai' => $giaSu->user->trang_thai,
            ],
        ]);
    }
}

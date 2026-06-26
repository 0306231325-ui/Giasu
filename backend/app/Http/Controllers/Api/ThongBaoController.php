<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ThongBao;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ThongBaoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $danhSach = ThongBao::query()
            ->where('user_id', $user->id)
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (ThongBao $thongBao) => $this->dinhDang($thongBao))
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'chuaDoc' => ThongBao::query()
                    ->where('user_id', $user->id)
                    ->where('da_doc', false)
                    ->count(),
                'danhSach' => $danhSach,
            ],
        ]);
    }

    public function danhDauDaDoc(Request $request, int $thongBaoId): JsonResponse
    {
        $thongBao = ThongBao::query()
            ->where('user_id', $request->user()->id)
            ->find($thongBaoId);

        if (! $thongBao) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy thông báo.',
            ], 404);
        }

        $thongBao->update(['da_doc' => true]);

        return response()->json([
            'success' => true,
            'data' => $this->dinhDang($thongBao->fresh()),
        ]);
    }

    public function xoa(Request $request, int $thongBaoId): JsonResponse
    {
        $thongBao = ThongBao::query()
            ->where('user_id', $request->user()->id)
            ->find($thongBaoId);

        if (! $thongBao) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy thông báo.',
            ], 404);
        }

        $thongBao->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xoá thông báo.',
        ]);
    }

    private function dinhDang(ThongBao $thongBao): array
    {
        return [
            'id' => $thongBao->id,
            'tieuDe' => $thongBao->tieu_de,
            'noiDung' => $thongBao->noi_dung,
            'url' => $thongBao->url,
            'daDoc' => (bool) $thongBao->da_doc,
            'thoiGian' => $thongBao->created_at?->diffForHumans() ?? '',
        ];
    }
}

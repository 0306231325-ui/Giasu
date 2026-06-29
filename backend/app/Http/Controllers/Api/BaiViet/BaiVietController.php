<?php

namespace App\Http\Controllers\Api\BaiViet;

use App\Http\Controllers\Controller;
use App\Models\BaiViet;
use Illuminate\Http\Request;

class BaiVietController extends Controller
{
    public function baiVietMoi()
    {
        $baiviet = BaiViet::where('trang_thai', 'xuat_ban')
            ->latest()
            ->take(4)
            ->get();

        return response()->json($baiviet);
    }

    public function danhSachPublic(Request $request)
    {
        $keyword = trim((string) $request->query('q', ''));

        $baiviet = BaiViet::query()
            ->where('trang_thai', 'xuat_ban')
            ->when($keyword !== '', function ($query) use ($keyword) {
                $query->where(function ($subQuery) use ($keyword) {
                    $subQuery
                        ->where('tieu_de', 'like', "%{$keyword}%")
                        ->orWhere('tom_tat', 'like', "%{$keyword}%")
                        ->orWhere('noi_dung', 'like', "%{$keyword}%");
                });
            })
            ->latest()
            ->paginate(9)
            ->withQueryString();

        return response()->json([
            'success' => true,
            'data' => $baiviet,
        ]);
    }

    public function chiTiet($slug)
    {
        $baiviet = BaiViet::where('slug', $slug)->firstOrFail();

        $baiviet->increment('luot_xem');

        return response()->json($baiviet);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BaiViet;

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

    public function chiTiet($slug)
{
    $baiviet = BaiViet::where('slug', $slug)->firstOrFail();

    // tăng lượt xem
    $baiviet->increment('luot_xem');

    return response()->json($baiviet);
}
}
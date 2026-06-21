<?php

namespace App\Http\Controllers;

use App\Models\Banner;

class BannerController extends Controller
{
    public function index()
    {
        $banner = Banner::where('trang_thai', 'hienthi')->get();

        $banner->transform(function ($item) {

            $item->anh = asset($item->anh);

            return $item;

        });

        return response()->json($banner);
    }
}

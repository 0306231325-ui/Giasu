<?php
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\Api\BaiVietController;
use App\Http\Controllers\Api\GiasuController;
use App\Http\Controllers\Api\MonHocController;

Route::get('/test-db', function () {
    return DB::select("SHOW TABLES");
});

Route::get('/test', function () {
    return response()->json([
        'message' => 'Laravel API ok'
    ]);
});




Route::get('/baiviet-moi', [BaiVietController::class, 'baiVietMoi']);

Route::get('/baiviet/{slug}', [BaiVietController::class, 'chiTiet']);

Route::get('/banner', [BannerController::class, 'index']);

Route::get('/gia-su', [GiasuController::class, 'index']);

Route::get('/mon-hoc', [MonHocController::class, 'index']);
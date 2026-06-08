<?php
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\Api\BaiVietController;
use App\Http\Controllers\Api\GiasuController;
use App\Http\Controllers\Api\MonHocController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminHocVienController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/admin/hoc-vien', [AdminHocVienController::class, 'danhSachHocVien']);
    Route::patch('/admin/hoc-vien/{hocVienId}/trang-thai', [AdminHocVienController::class, 'capNhatTrangThaiHocVien']);
    Route::get('/admin/baiviet', [BaiVietController::class, 'danhSachBaiVietAdmin']);
    Route::get('/admin/baiviet/thung-rac', [BaiVietController::class, 'thungRacBaiVietAdmin']);
    Route::post('/admin/baiviet', [BaiVietController::class, 'taoBaiVietAdmin']);
    Route::patch('/admin/baiviet/{baiVietId}', [BaiVietController::class, 'capNhatBaiVietAdmin']);
    Route::post('/admin/baiviet/{baiVietId}/cap-nhat', [BaiVietController::class, 'capNhatBaiVietAdmin']);
    Route::delete('/admin/baiviet/{baiVietId}', [BaiVietController::class, 'xoaBaiVietAdmin']);
    Route::patch('/admin/baiviet/{baiVietId}/khoi-phuc', [BaiVietController::class, 'khoiPhucBaiVietAdmin']);
});

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

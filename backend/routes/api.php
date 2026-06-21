<?php
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\Api\BaiVietController;
use App\Http\Controllers\Api\GiasuController;
use App\Http\Controllers\Api\MonHocController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminHocVienController;
use App\Http\Controllers\Api\DangKyGiaSuController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/gia-su/ho-so/ca-nhan', [GiasuController::class, 'hoSoCaNhan']);
    Route::patch('/gia-su/ho-so/ca-nhan', [GiasuController::class, 'capNhatHoSoCaNhan']);
    Route::get('/gia-su/ho-so/chuyen-mon', [GiasuController::class, 'chuyenMon']);
    Route::patch('/gia-su/ho-so/chuyen-mon', [GiasuController::class, 'capNhatChuyenMon']);
    Route::get('/gia-su/ho-so/mon-day', [GiasuController::class, 'danhSachMonDay']);
    Route::post('/gia-su/ho-so/mon-day', [GiasuController::class, 'themMonDay']);
    Route::delete('/gia-su/ho-so/mon-day/{mucGiaId}', [GiasuController::class, 'xoaMonDay']);
    Route::get('/gia-su/ho-so/bang-cap', [GiasuController::class, 'danhSachBangCap']);
    Route::post('/gia-su/ho-so/bang-cap', [GiasuController::class, 'themBangCap']);
    Route::get('/gia-su/ho-so/bang-cap/{bangCapId}/xem', [GiasuController::class, 'xemBangCap'])
        ->name('gia-su.bang-cap.xem');
    Route::delete('/gia-su/ho-so/bang-cap/{bangCapId}', [GiasuController::class, 'xoaBangCap']);
    Route::get('/admin/hoc-vien', [AdminHocVienController::class, 'danhSachHocVien']);
    Route::patch('/admin/hoc-vien/{hocVienId}/trang-thai', [AdminHocVienController::class, 'capNhatTrangThaiHocVien']);
    Route::get('/admin/baiviet', [BaiVietController::class, 'danhSachBaiVietAdmin']);
    Route::get('/admin/baiviet/thung-rac', [BaiVietController::class, 'thungRacBaiVietAdmin']);
    Route::post('/admin/baiviet', [BaiVietController::class, 'taoBaiVietAdmin']);
    Route::patch('/admin/baiviet/{baiVietId}', [BaiVietController::class, 'capNhatBaiVietAdmin']);
    Route::post('/admin/baiviet/{baiVietId}/cap-nhat', [BaiVietController::class, 'capNhatBaiVietAdmin']);
    Route::delete('/admin/baiviet/{baiVietId}', [BaiVietController::class, 'xoaBaiVietAdmin']);
    Route::patch('/admin/baiviet/{baiVietId}/khoi-phuc', [BaiVietController::class, 'khoiPhucBaiVietAdmin']);
    Route::delete('/admin/baiviet/{baiVietId}/xoa-vinh-vien', [BaiVietController::class, 'xoaVinhVienBaiVietAdmin']);
});





Route::get('/baiviet-moi', [BaiVietController::class, 'baiVietMoi']);

Route::get('/baiviet/{slug}', [BaiVietController::class, 'chiTiet']);

Route::get('/banner', [BannerController::class, 'index']);

Route::get('/gia-su', [GiasuController::class, 'index']);

Route::get('/dang-ky-gia-su/danh-muc', [DangKyGiaSuController::class, 'danhMuc']);
Route::post('/dang-ky-gia-su/tinh-gia', [DangKyGiaSuController::class, 'tinhGia']);

Route::get('/mon-hoc', [MonHocController::class, 'index']);

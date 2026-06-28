<?php
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\Api\BaiVietController;
use App\Http\Controllers\Api\GiasuController;
use App\Http\Controllers\Api\MonHocController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminGiaSuController;
use App\Http\Controllers\Api\AdminHocVienController;
use App\Http\Controllers\Api\DangKyGiaSuController;
use App\Http\Controllers\Api\DatLichController;
use App\Http\Controllers\Api\ThongBaoController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/thong-bao', [ThongBaoController::class, 'index']);
    Route::patch('/thong-bao/{thongBaoId}/da-doc', [ThongBaoController::class, 'danhDauDaDoc']);
    Route::delete('/thong-bao/{thongBaoId}', [ThongBaoController::class, 'xoa']);
    Route::post('/dang-ky-gia-su', [DangKyGiaSuController::class, 'guiDon']);
    Route::post('/gia-su/{giaSuId}/goi-hoc', [DatLichController::class, 'datLich']);
    Route::get('/hoc-vien/lich-hoc', [DatLichController::class, 'lichHocCuaToi']);
    Route::post('/hoc-vien/lich-hoc/{lichHocId}/danh-gia', [DatLichController::class, 'danhGiaBuoiHoc']);
    Route::post('/hoc-vien/lich-hoc/{lichHocId}/doi-buoi', [DatLichController::class, 'yeuCauDoiBuoiHoc']);
    Route::post('/hoc-vien/goi-hoc/{goiHocId}/thanh-toan', [DatLichController::class, 'thanhToanGoiHoc']);
    Route::get('/gia-su/lich-day', [DatLichController::class, 'lichDayGiaSu']);
    Route::get('/gia-su/yeu-cau-dat-goi', [DatLichController::class, 'danhSachYeuCauGiaSu']);
    Route::patch('/gia-su/yeu-cau-dat-goi/{goiHocId}/phan-hoi', [DatLichController::class, 'phanHoiYeuCauGiaSu']);
    Route::get('/hoc-vien/ho-so', [AuthController::class, 'hoSoHocVien']);
    Route::patch('/hoc-vien/ho-so', [AuthController::class, 'capNhatHoSoHocVien']);
    Route::post('/hoc-vien/ho-so/cap-nhat', [AuthController::class, 'capNhatHoSoHocVien']);
    Route::get('/gia-su/ho-so/ca-nhan', [GiasuController::class, 'hoSoCaNhan']);
    Route::patch('/gia-su/ho-so/ca-nhan', [GiasuController::class, 'capNhatHoSoCaNhan']);
    Route::post('/gia-su/ho-so/avatar', [GiasuController::class, 'capNhatAvatar']);
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
    Route::get('/admin/gia-su', [AdminGiaSuController::class, 'danhSachGiaSu']);
    Route::get('/admin/dat-goi', [DatLichController::class, 'danhSachDatGoiAdmin']);
    Route::patch('/admin/dat-goi/{goiHocId}/gui-gia-su', [DatLichController::class, 'guiGoiChoGiaSu']);
    Route::patch('/admin/dat-goi/{goiHocId}/cho-thanh-toan', [DatLichController::class, 'chuyenGoiChoThanhToan']);
    Route::patch('/admin/dat-goi/{goiHocId}/huy', [DatLichController::class, 'huyGoiAdmin']);
    Route::get('/admin/gia-su/xet-duyet', [AdminGiaSuController::class, 'danhSachHoSoChoDuyet']);
    Route::patch('/admin/gia-su/xet-duyet/{giaSuId}', [AdminGiaSuController::class, 'xuLyHoSoDangKy']);
    Route::get('/admin/gia-su/bang-cap/{bangCapId}/xem', [AdminGiaSuController::class, 'xemBangCapAdmin']);
    Route::patch('/admin/gia-su/{giaSuId}/trang-thai', [AdminGiaSuController::class, 'capNhatTrangThaiGiaSu']);
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
Route::get('/tim-gia-su-theo-yeu-cau', [GiasuController::class, 'timTheoYeuCau']);

Route::get('/dang-ky-gia-su/danh-muc', [DangKyGiaSuController::class, 'danhMuc']);
Route::post('/dang-ky-gia-su/tinh-gia', [DangKyGiaSuController::class, 'tinhGia']);

Route::get('/mon-hoc', [MonHocController::class, 'index']);
Route::get('/loai-goi', [DatLichController::class, 'danhSachLoaiGoi']);

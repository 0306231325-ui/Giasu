<?php
use App\Http\Controllers\Api\Admin\AdminBaiVietController;
use App\Http\Controllers\Api\Admin\AdminDoanhThuController;
use App\Http\Controllers\Api\Admin\AdminGiaSuBangCapController;
use App\Http\Controllers\Api\Admin\AdminGiaSuController;
use App\Http\Controllers\Api\Admin\AdminHocVienController;
use App\Http\Controllers\Api\Admin\AdminNhatKyHeThongController;
use App\Http\Controllers\Api\Admin\AdminTrangThaiGiaSuController;
use App\Http\Controllers\Api\Admin\AdminXetDuyetGiaSuController;
use App\Http\Controllers\Api\Admin\AdminYeuCauChuyenMonController;
use App\Http\Controllers\Api\AdminDanhMucController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BaiViet\BaiVietController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\DangKyGiaSuController;
use App\Http\Controllers\Api\DatGoi\AdminDatGoiController;
use App\Http\Controllers\Api\DatGoi\DatGoiController;
use App\Http\Controllers\Api\DatGoi\GiaSuYeuCauDatGoiController;
use App\Http\Controllers\Api\DatGoi\ThanhToanGoiHocController;
use App\Http\Controllers\Api\GiaSu\GiaSuBangCapController;
use App\Http\Controllers\Api\GiaSu\GiaSuChuyenMonController;
use App\Http\Controllers\Api\GiaSu\GiaSuHoSoController;
use App\Http\Controllers\Api\GiaSu\GiaSuMonDayController;
use App\Http\Controllers\Api\GiaSu\GiaSuTheoDoiHoatDongController;
use App\Http\Controllers\Api\GiaSu\GiaSuThuNhapController;
use App\Http\Controllers\Api\GiaSu\GiasuController;
use App\Http\Controllers\Api\HocVien\HocVienHoSoController;
use App\Http\Controllers\Api\HocVien\HocVienLichHocController;
use App\Http\Controllers\Api\HocVien\HocVienThanhToanController;
use App\Http\Controllers\Api\LichHoc\AdminLichHocController;
use App\Http\Controllers\Api\LichHoc\GiaSuLichHocController;
use App\Http\Controllers\Api\LichHoc\HocVienLichHocController as HocVienLichHocDatGoiController;
use App\Http\Controllers\Api\MonHocController;
use App\Http\Controllers\Api\ThongBaoController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware(['auth:sanctum', 'tai_khoan.hoat_dong'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::prefix('thong-bao')->group(function () {
        Route::get('/', [ThongBaoController::class, 'index']);
        Route::patch('/{thongBaoId}/da-doc', [ThongBaoController::class, 'danhDauDaDoc']);
        Route::delete('/', [ThongBaoController::class, 'xoaTatCa']);
        Route::delete('/{thongBaoId}', [ThongBaoController::class, 'xoa']);
    });

    Route::post('/dang-ky-gia-su', [DangKyGiaSuController::class, 'guiDon']);

    Route::prefix('hoc-vien')->group(function () {
        Route::prefix('ho-so')->group(function () {
            Route::get('/', [HocVienHoSoController::class, 'hoSoHocVien']);
            Route::patch('/', [HocVienHoSoController::class, 'capNhatHoSoHocVien']);
            Route::post('/cap-nhat', [HocVienHoSoController::class, 'capNhatHoSoHocVien']);
        });

        Route::prefix('lich-hoc')->group(function () {
            Route::get('/', [HocVienLichHocController::class, 'lichHocCuaToi']);
            Route::post('/{lichHocId}/xac-nhan-hoan-thanh', [HocVienLichHocDatGoiController::class, 'hocVienXacNhanHoanThanhBuoiHoc']);
            Route::post('/{lichHocId}/danh-gia', [HocVienLichHocController::class, 'danhGiaBuoiHoc']);
            Route::post('/{lichHocId}/doi-buoi', [HocVienLichHocController::class, 'yeuCauDoiBuoiHoc']);
            Route::get('/{lichHocId}/khoang-thoi-gian-ban', [HocVienLichHocController::class, 'thongTinKhoangThoiGianBan']);
            Route::post('/{lichHocId}/phan-hoi-hoc-bu', [HocVienLichHocController::class, 'phanHoiYeuCauHocBuTuGiaSu']);
        });

        Route::get('/thanh-toan', [HocVienThanhToanController::class, 'lichSuThanhToan']);
        Route::post('/goi-hoc/{goiHocId}/thanh-toan', [HocVienThanhToanController::class, 'thanhToanGoiHoc']);
        Route::patch('/goi-hoc/{goiHocId}/huy', [DatGoiController::class, 'hocVienHuyGoiHoc']);
    });

    Route::prefix('gia-su')->group(function () {
        Route::get('/dem-can-xu-ly', [GiasuController::class, 'demCanXuLy']);
        Route::post('/{giaSuId}/goi-hoc', [DatGoiController::class, 'datLich']);
        Route::get('/lich-day', [GiaSuLichHocController::class, 'lichDayGiaSu']);
        Route::patch('/lich-day/{lichHocId}/link-hoc-online', [GiaSuLichHocController::class, 'capNhatLinkHocOnline']);
        Route::post('/lich-day/{lichHocId}/xac-nhan-hoan-thanh', [GiaSuLichHocController::class, 'giaSuXacNhanHoanThanhBuoiHoc']);
        Route::post('/lich-day/{lichHocId}/doi-buoi', [GiaSuLichHocController::class, 'yeuCauDoiBuoiGiaSu']);
        Route::get('/lich-day/{lichHocId}/khoang-thoi-gian-ban', [GiaSuLichHocController::class, 'thongTinKhoangThoiGianBan']);
        Route::get('/yeu-cau-doi-buoi', [GiaSuLichHocController::class, 'danhSachYeuCauDoiBuoiGiaSu']);
        Route::patch('/yeu-cau-doi-buoi/{yeuCauId}/phan-hoi', [GiaSuLichHocController::class, 'phanHoiYeuCauDoiBuoiGiaSu']);
        Route::get('/thu-nhap', [GiaSuThuNhapController::class, 'thongKe']);
        Route::get('/theo-doi-hoat-dong', [GiaSuTheoDoiHoatDongController::class, 'thongKe']);
        Route::get('/yeu-cau-dat-goi', [GiaSuYeuCauDatGoiController::class, 'danhSachYeuCauGiaSu']);
        Route::patch('/yeu-cau-dat-goi/{goiHocId}/phan-hoi', [GiaSuYeuCauDatGoiController::class, 'phanHoiYeuCauGiaSu']);

        Route::prefix('ho-so')->group(function () {
            Route::get('/ca-nhan', [GiaSuHoSoController::class, 'hoSoCaNhan']);
            Route::patch('/ca-nhan', [GiaSuHoSoController::class, 'capNhatHoSoCaNhan']);
            Route::post('/avatar', [GiaSuHoSoController::class, 'capNhatAvatar']);

            Route::get('/chuyen-mon', [GiaSuChuyenMonController::class, 'chuyenMon']);
            Route::patch('/chuyen-mon', [GiaSuChuyenMonController::class, 'capNhatChuyenMon']);

            Route::prefix('mon-day')->group(function () {
                Route::get('/', [GiaSuMonDayController::class, 'danhSachMonDay']);
                Route::post('/', [GiaSuMonDayController::class, 'themMonDay']);
                Route::delete('/{mucGiaId}', [GiaSuMonDayController::class, 'xoaMonDay']);
            });

            Route::prefix('bang-cap')->group(function () {
                Route::get('/', [GiaSuBangCapController::class, 'danhSachBangCap']);
                Route::post('/', [GiaSuBangCapController::class, 'themBangCap']);
                Route::get('/{bangCapId}/xem', [GiaSuBangCapController::class, 'xemBangCap'])
                    ->name('gia-su.bang-cap.xem');
                Route::delete('/{bangCapId}', [GiaSuBangCapController::class, 'xoaBangCap']);
            });
        });
    });

    Route::prefix('admin')->group(function () {
        Route::get('/doanh-thu', [AdminDoanhThuController::class, 'tongQuan']);
        Route::get('/nhat-ky', [AdminNhatKyHeThongController::class, 'index']);

        Route::prefix('dat-goi')->group(function () {
            Route::get('/', [AdminDatGoiController::class, 'danhSachDatGoiAdmin']);
            Route::patch('/{goiHocId}/gui-gia-su', [AdminDatGoiController::class, 'guiGoiChoGiaSu']);
            Route::patch('/{goiHocId}/cho-thanh-toan', [AdminDatGoiController::class, 'chuyenGoiChoThanhToan']);
            Route::patch('/{goiHocId}/nhac-thanh-toan', [AdminDatGoiController::class, 'nhacThanhToanAdmin']);
            Route::patch('/{goiHocId}/duyet-thanh-toan', [ThanhToanGoiHocController::class, 'duyetThanhToanAdmin']);
            Route::patch('/{goiHocId}/tu-choi-thanh-toan', [ThanhToanGoiHocController::class, 'tuChoiThanhToanAdmin']);
            Route::patch('/{goiHocId}/huy', [AdminDatGoiController::class, 'huyGoiAdmin']);
        });

        Route::prefix('lich-hoc')->group(function () {
            Route::get('/', [AdminLichHocController::class, 'danhSachLichHocAdmin']);
            Route::get('/yeu-cau-doi-buoi', [AdminLichHocController::class, 'danhSachYeuCauDoiBuoiAdmin']);
            Route::patch('/yeu-cau-doi-buoi/{yeuCauId}/gui-gia-su', [AdminLichHocController::class, 'guiYeuCauDoiBuoiChoGiaSu']);
            Route::patch('/yeu-cau-doi-buoi/{yeuCauId}/duyet', [AdminLichHocController::class, 'duyetYeuCauDoiBuoi']);
            Route::patch('/yeu-cau-doi-buoi/{yeuCauId}/tu-choi', [AdminLichHocController::class, 'tuChoiYeuCauDoiBuoi']);
            Route::patch('/{lichHocId}/hoan-thanh', [AdminLichHocController::class, 'adminXacNhanHoanThanhLichHoc']);
            Route::patch('/{lichHocId}/huy', [AdminLichHocController::class, 'adminHuyLichHoc']);
        });

        Route::prefix('gia-su')->group(function () {
            Route::get('/', [AdminGiaSuController::class, 'danhSachGiaSu']);
            Route::get('/xet-duyet', [AdminXetDuyetGiaSuController::class, 'danhSachHoSoChoDuyet']);
            Route::patch('/xet-duyet/{giaSuId}', [AdminXetDuyetGiaSuController::class, 'xuLyHoSoDangKy']);
            Route::get('/yeu-cau-chuyen-mon', [AdminYeuCauChuyenMonController::class, 'danhSach']);
            Route::patch('/yeu-cau-chuyen-mon/{loai}/{id}', [AdminYeuCauChuyenMonController::class, 'xuLy']);
            Route::get('/bang-cap/{bangCapId}/xem', [AdminGiaSuBangCapController::class, 'xemBangCapAdmin']);
            Route::patch('/{giaSuId}/trang-thai', [AdminTrangThaiGiaSuController::class, 'capNhatTrangThaiGiaSu']);
        });

        Route::prefix('hoc-vien')->group(function () {
            Route::get('/', [AdminHocVienController::class, 'danhSachHocVien']);
            Route::patch('/{hocVienId}/trang-thai', [AdminHocVienController::class, 'capNhatTrangThaiHocVien']);
        });

        Route::prefix('mon-hoc')->group(function () {
            Route::get('/', [MonHocController::class, 'danhSachAdmin']);
            Route::post('/', [MonHocController::class, 'taoAdmin']);
            Route::patch('/{monHocId}', [MonHocController::class, 'capNhatAdmin']);
            Route::delete('/{monHocId}', [MonHocController::class, 'xoaAdmin']);
        });

        Route::prefix('danh-muc')->group(function () {
            Route::get('/', [AdminDanhMucController::class, 'index']);
            Route::post('/{loai}', [AdminDanhMucController::class, 'store']);
            Route::patch('/{loai}/{id}', [AdminDanhMucController::class, 'update']);
            Route::delete('/{loai}/{id}', [AdminDanhMucController::class, 'destroy']);
        });

        Route::prefix('baiviet')->group(function () {
            Route::get('/', [AdminBaiVietController::class, 'danhSachBaiVietAdmin']);
            Route::get('/thung-rac', [AdminBaiVietController::class, 'thungRacBaiVietAdmin']);
            Route::post('/', [AdminBaiVietController::class, 'taoBaiVietAdmin']);
            Route::patch('/{baiVietId}', [AdminBaiVietController::class, 'capNhatBaiVietAdmin']);
            Route::post('/{baiVietId}/cap-nhat', [AdminBaiVietController::class, 'capNhatBaiVietAdmin']);
            Route::delete('/{baiVietId}', [AdminBaiVietController::class, 'xoaBaiVietAdmin']);
            Route::patch('/{baiVietId}/khoi-phuc', [AdminBaiVietController::class, 'khoiPhucBaiVietAdmin']);
            Route::delete('/{baiVietId}/xoa-vinh-vien', [AdminBaiVietController::class, 'xoaVinhVienBaiVietAdmin']);
        });
    });
});

Route::get('/baiviet-moi', [BaiVietController::class, 'baiVietMoi']);
Route::get('/baiviet', [BaiVietController::class, 'danhSachPublic']);
Route::get('/baiviet/{slug}', [BaiVietController::class, 'chiTiet']);

Route::get('/banner', [BannerController::class, 'index']);

Route::get('/gia-su', [GiasuController::class, 'index']);
Route::get('/gia-su/{giaSuId}/lich-ban', [DatGoiController::class, 'lichBanGiaSu']);
Route::get('/tim-gia-su-theo-yeu-cau', [GiasuController::class, 'timTheoYeuCau']);

Route::get('/dang-ky-gia-su/danh-muc', [DangKyGiaSuController::class, 'danhMuc']);
Route::post('/dang-ky-gia-su/tinh-gia', [DangKyGiaSuController::class, 'tinhGia']);

Route::get('/mon-hoc', [MonHocController::class, 'index']);
Route::get('/loai-goi', [DatGoiController::class, 'danhSachLoaiGoi']);
Route::get('/mon-hoc', [MonHocController::class, 'index']);
Route::get('/loai-goi', [DatGoiController::class, 'danhSachLoaiGoi']);

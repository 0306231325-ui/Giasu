<?php

namespace App\Http\Controllers\Api\DatGoi;

use App\Http\Controllers\Api\DatLich\DatLichBaseController;
use App\Models\Giasu;
use App\Models\GiasuGia;
use App\Models\GoiHoc;
use App\Models\DanhGia;
use App\Models\LichHoc;
use App\Models\LoaiGoi;
use App\Models\PhanHoi;
use App\Models\ThanhToan;
use App\Models\ThongBao;
use App\Models\User;
use App\Models\YeuCauHocBu;
use App\Services\NhatKyHeThongService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\Rule;

class ThanhToanGoiHocController extends DatLichBaseController
{
    public function thanhToanGoiHoc(Request $request, int $goiHocId): JsonResponse
    {
        $user = $request->user();

        if ($user->vai_tro !== 'hocvien') {
            return response()->json([
                'success' => false,
                'message' => 'Chuc nang thanh toan chi danh cho tai khoan hoc vien.',
            ], 403);
        }

        $duLieu = $request->validate([
            'phuong_thuc' => ['required', Rule::in(['tienmat', 'momo', 'zalopay', 'banking'])],
            'ma_giaodich' => ['nullable', 'string', 'max:255'],
            'noi_dung_thanhtoan' => ['nullable', 'string', 'max:1000'],
            'anh_minh_chung' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ], [
            'anh_minh_chung.required' => 'Vui lòng chọn ảnh minh chứng thanh toán.',
            'anh_minh_chung.image' => 'Ảnh minh chứng thanh toán không hợp lệ.',
            'anh_minh_chung.mimes' => 'Ảnh minh chứng chỉ hỗ trợ JPG, JPEG, PNG hoặc WEBP.',
            'anh_minh_chung.max' => 'Ảnh minh chứng không được lớn hơn 4MB.',
            'anh_minh_chung.uploaded' => 'Tải ảnh minh chứng thất bại. Vui lòng chọn ảnh nhỏ hơn 2MB hoặc thử ảnh khác.',
        ]);

        $goiHoc = GoiHoc::query()
            ->with(['hocVien:id,ho_ten', 'giasu.user:id,ho_ten', 'monHoc:id,ten_mon,lop', 'lichHocs', 'thanhToanMoiNhat'])
            ->where('hocvien_id', $user->id)
            ->where('trang_thai', 'cho_thanhtoan')
            ->find($goiHocId);

        if (! $goiHoc) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay goi hoc dang cho thanh toan.',
            ], 404);
        }

        if (! $this->goiHocCanThanhToan($goiHoc)) {
            return response()->json([
                'success' => false,
                'message' => 'Gói học miễn phí hoặc học thử không cần gửi minh chứng thanh toán.',
            ], 422);
        }

        if ($goiHoc->thanhToanMoiNhat?->trang_thai === 'cho_thanhtoan') {
            return response()->json([
                'success' => false,
                'message' => 'Ban da gui minh chung thanh toan. Vui long cho admin xac nhan.',
            ], 422);
        }

        $duongDanMinhChung = $this->luuAnhMinhChungThanhToan($request);
        $maGiaoDich = filled($duLieu['ma_giaodich'] ?? null)
            ? trim($duLieu['ma_giaodich'])
            : 'GD' . now()->format('YmdHis') . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT);

        $goiHocMoi = DB::transaction(function () use ($goiHoc, $duLieu, $user, $duongDanMinhChung, $maGiaoDich) {
            ThanhToan::create([
                'goihoc_id' => $goiHoc->id,
                'so_tien' => $goiHoc->tong_tien,
                'phuong_thuc' => $duLieu['phuong_thuc'],
                'ma_giaodich' => $maGiaoDich,
                'noi_dung_thanhtoan' => filled($duLieu['noi_dung_thanhtoan'] ?? null)
                    ? trim($duLieu['noi_dung_thanhtoan'])
                    : 'Học viên gửi minh chứng thanh toán gói học.',
                'anh_minh_chung' => $duongDanMinhChung,
                'ngay_thanhtoan' => now(),
                'trang_thai' => 'cho_thanhtoan',
            ]);

            User::query()
                ->where('vai_tro', 'admin')
                ->get(['id'])
                ->each(fn (User $admin) => ThongBao::create([
                    'user_id' => $admin->id,
                    'tieu_de' => 'Học viên gửi minh chứng thanh toán',
                    'noi_dung' => "{$user->ho_ten} đã gửi minh chứng thanh toán gói học GH" . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT) . '. Vui lòng kiểm tra và xác nhận.',
                    'url' => '/admin/quan-ly-dat-goi',
                    'da_doc' => false,
                ]));

            return $goiHoc->fresh(['monHoc:id,ten_mon,lop', 'giasu.user:id,ho_ten', 'lichHocs', 'thanhToanMoiNhat']);
        });

        NhatKyHeThongService::ghi(
            $user,
            'gui_minh_chung_thanh_toan',
            $goiHoc->id,
            "{$user->ho_ten} gửi minh chứng thanh toán cho gói GH" . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT) . "."
        );

        return response()->json([
            'success' => true,
            'message' => 'Da gui minh chung thanh toan. Vui long cho admin xac nhan.',
            'data' => $this->dinhDangGoiHocChoHocVien($goiHocMoi),
        ]);
    }
    public function duyetThanhToanAdmin(Request $request, int $goiHocId): JsonResponse
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Ban khong co quyen truy cap.',
            ], 403);
        }

        $goiHoc = GoiHoc::query()
            ->with(['hocVien:id,ho_ten', 'monHoc:id,ten_mon,lop', 'giasu.user:id,ho_ten', 'lichHocs', 'phanHoiMoiNhat', 'thanhToanMoiNhat'])
            ->where('trang_thai', 'cho_thanhtoan')
            ->find($goiHocId);

        if (! $goiHoc || ! $goiHoc->thanhToanMoiNhat) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay thanh toan can xac nhan.',
            ], 404);
        }

        if ($goiHoc->thanhToanMoiNhat->trang_thai !== 'cho_thanhtoan') {
            return response()->json([
                'success' => false,
                'message' => 'Thanh toan nay khong con o trang thai cho xac nhan.',
            ], 422);
        }

        DB::transaction(function () use ($goiHoc) {
            $goiHoc->thanhToanMoiNhat->update([
                'trang_thai' => 'da_thanhtoan',
            ]);

            $goiHoc->update([
                'trang_thai' => 'danghoc',
            ]);

            $goiHoc->lichHocs()->update([
                'trang_thai' => 'da_nhan',
            ]);

            ThongBao::create([
                'user_id' => $goiHoc->hocvien_id,
                'tieu_de' => 'Thanh toán đã được xác nhận',
                'noi_dung' => 'Thanh toán gói học ' . 'GH' . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT) . ' đã được xác nhận. Lịch học của bạn đã được kích hoạt.',
                'url' => '/hoc-vien/lich-hoc',
                'da_doc' => false,
            ]);

            if ($goiHoc->giasu?->user_id) {
                ThongBao::create([
                    'user_id' => $goiHoc->giasu->user_id,
                    'tieu_de' => 'Gói học đã được thanh toán',
                    'noi_dung' => 'Gói học ' . 'GH' . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT) . ' đã được xác nhận thanh toán. Bạn có thể theo dõi trong lịch dạy.',
                    'url' => '/gia-su/quan-ly/lich-day',
                    'da_doc' => false,
                ]);
            }
        });

        NhatKyHeThongService::ghi(
            $request->user(),
            'duyet_thanh_toan',
            $goiHoc->id,
            "Admin xác nhận thanh toán gói GH" . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT) . "."
        );

        return response()->json([
            'success' => true,
            'message' => 'Da xac nhan thanh toan va chuyen goi hoc sang dang hoc.',
            'data' => $this->dinhDangGoiHocChoAdmin($goiHoc->fresh(['hocVien', 'monHoc', 'giasu.user', 'lichHocs', 'phanHoiMoiNhat', 'thanhToanMoiNhat'])),
        ]);
    }
    public function tuChoiThanhToanAdmin(Request $request, int $goiHocId): JsonResponse
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Ban khong co quyen truy cap.',
            ], 403);
        }

        $duLieu = $request->validate([
            'ly_do' => ['nullable', 'string', 'max:1000'],
        ]);

        $goiHoc = GoiHoc::query()
            ->with(['hocVien:id,ho_ten', 'monHoc:id,ten_mon,lop', 'giasu.user:id,ho_ten', 'lichHocs', 'phanHoiMoiNhat', 'thanhToanMoiNhat'])
            ->where('trang_thai', 'cho_thanhtoan')
            ->find($goiHocId);

        if (! $goiHoc || ! $goiHoc->thanhToanMoiNhat) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay thanh toan can tu choi.',
            ], 404);
        }

        if ($goiHoc->thanhToanMoiNhat->trang_thai !== 'cho_thanhtoan') {
            return response()->json([
                'success' => false,
                'message' => 'Thanh toan nay khong con o trang thai cho xac nhan.',
            ], 422);
        }

        $lyDo = filled($duLieu['ly_do'] ?? null) ? trim($duLieu['ly_do']) : null;

        DB::transaction(function () use ($goiHoc, $lyDo) {
            $goiHoc->thanhToanMoiNhat->update([
                'trang_thai' => 'that_bai',
            ]);

            ThongBao::create([
                'user_id' => $goiHoc->hocvien_id,
                'tieu_de' => 'Thanh toán chưa hợp lệ',
                'noi_dung' => 'Thanh toán gói học ' . 'GH' . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT) . ' chưa được chấp nhận' . ($lyDo ? ': ' . $lyDo : '. Vui lòng kiểm tra và gửi lại minh chứng.'),
                'url' => '/hoc-vien/lich-hoc',
                'da_doc' => false,
            ]);
        });

        NhatKyHeThongService::ghi(
            $request->user(),
            'tu_choi_thanh_toan',
            $goiHoc->id,
            "Admin từ chối thanh toán gói GH" . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT) . ($lyDo ? ". Lý do: {$lyDo}" : ".")
        );

        return response()->json([
            'success' => true,
            'message' => 'Da tu choi thanh toan. Goi hoc van o trang thai cho thanh toan.',
            'data' => $this->dinhDangGoiHocChoAdmin($goiHoc->fresh(['hocVien', 'monHoc', 'giasu.user', 'lichHocs', 'phanHoiMoiNhat', 'thanhToanMoiNhat'])),
        ]);
    }
}

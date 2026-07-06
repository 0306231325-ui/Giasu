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
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\Rule;

class AdminDatGoiController extends DatLichBaseController
{
    public function danhSachDatGoiAdmin(Request $request): JsonResponse
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Ban khong co quyen truy cap.',
            ], 403);
        }

        $danhSach = GoiHoc::query()
            ->with([
                'hocVien:id,ho_ten,email,sdt',
                'monHoc:id,ten_mon,lop',
                'giasu.user:id,ho_ten,email,sdt',
                'lichHocs' => fn ($query) => $query->orderBy('ngay_hoc')->orderBy('gio_batdau'),
                'phanHoiMoiNhat',
                'thanhToanMoiNhat',
            ])
            ->latest()
            ->get()
            ->map(fn (GoiHoc $goiHoc) => $this->dinhDangGoiHocChoAdmin($goiHoc))
            ->values();

        return response()->json([
            'success' => true,
            'data' => $danhSach,
        ]);
    }
    public function guiGoiChoGiaSu(Request $request, int $goiHocId): JsonResponse
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Ban khong co quyen truy cap.',
            ], 403);
        }

        $goiHoc = GoiHoc::query()
            ->with(['hocVien:id,ho_ten', 'giasu.user:id,ho_ten'])
            ->where('trang_thai', 'cho_xacnhan')
            ->find($goiHocId);

        if (! $goiHoc || ! $goiHoc->giasu) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay goi hoc dang cho xu ly.',
            ], 404);
        }

        $goiHoc->update([
            'gui_giasu_luc' => now(),
        ]);

        ThongBao::create([
            'user_id' => $goiHoc->giasu->user_id,
            'tieu_de' => 'Có yêu cầu đặt gói mới',
            'noi_dung' => ($goiHoc->hocVien?->ho_ten ?? 'Học viên') . ' đã đặt gói học và admin đã chuyển cho bạn xử lý.',
            'url' => '/gia-su/quan-ly/lich-day',
            'da_doc' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Da gui yeu cau dat goi cho gia su.',
            'data' => $this->dinhDangGoiHocChoAdmin($goiHoc->fresh(['hocVien', 'monHoc', 'giasu.user', 'lichHocs', 'phanHoiMoiNhat', 'thanhToanMoiNhat'])),
        ]);
    }
    public function chuyenGoiChoThanhToan(Request $request, int $goiHocId): JsonResponse
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Ban khong co quyen truy cap.',
            ], 403);
        }

        $goiHoc = GoiHoc::query()
            ->with(['hocVien:id,ho_ten', 'monHoc:id,ten_mon,lop', 'giasu.user:id,ho_ten', 'lichHocs', 'phanHoiMoiNhat'])
            ->where('trang_thai', 'cho_xacnhan')
            ->find($goiHocId);

        if (! $goiHoc || $goiHoc->phanHoiMoiNhat?->phan_hoi !== PhanHoi::DONG_Y) {
            return response()->json([
                'success' => false,
                'message' => 'Chi co the chuyen thanh toan sau khi gia su dong y.',
            ], 422);
        }

        $laHocThu = $this->laGoiHocThu($goiHoc);

        $goiHoc->update([
            'trang_thai' => $laHocThu ? 'danghoc' : 'cho_thanhtoan',
        ]);

        if ($laHocThu) {
            $goiHoc->lichHocs()->update([
                'trang_thai' => 'da_nhan',
            ]);
        }

        ThongBao::create([
            'user_id' => $goiHoc->hocvien_id,
            'tieu_de' => 'Yêu cầu đặt gói đã được chấp nhận',
            'noi_dung' => 'Gia sư đã đồng ý nhận lớp. Bạn có thể tiến hành thanh toán gói học.',
            'url' => '/hoc-vien/lich-hoc',
            'da_doc' => false,
        ]);

        if ($laHocThu) {
            ThongBao::query()
                ->where('user_id', $goiHoc->hocvien_id)
                ->latest()
                ->first()
                ?->update([
                    'tieu_de' => 'Goi hoc thu da duoc duyet',
                    'noi_dung' => 'Gia su da dong y va admin da duyet goi hoc thu. Lich hoc cua ban da duoc kich hoat.',
                ]);
        }

        return response()->json([
            'success' => true,
            'message' => $laHocThu ? 'Da duyet goi hoc thu va kich hoat lich hoc.' : 'Da chuyen goi hoc sang cho thanh toan.',
            'data' => $this->dinhDangGoiHocChoAdmin($goiHoc->fresh(['hocVien', 'monHoc', 'giasu.user', 'lichHocs', 'phanHoiMoiNhat', 'thanhToanMoiNhat'])),
        ]);
    }
    public function nhacThanhToanAdmin(Request $request, int $goiHocId): JsonResponse
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

        if (! $goiHoc) {
            return response()->json([
                'success' => false,
                'message' => 'Chi co the nhac thanh toan voi goi dang cho thanh toan.',
            ], 404);
        }

        ThongBao::create([
            'user_id' => $goiHoc->hocvien_id,
            'tieu_de' => 'Nhắc thanh toán gói học',
            'noi_dung' => 'Gói học ' . 'GH' . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT) . ' đang chờ thanh toán. Vui lòng hoàn tất thanh toán để kích hoạt lịch học.',
            'url' => '/hoc-vien/lich-hoc',
            'da_doc' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Da gui thong bao nhac thanh toan cho hoc vien.',
            'data' => $this->dinhDangGoiHocChoAdmin($goiHoc),
        ]);
    }
    public function huyGoiAdmin(Request $request, int $goiHocId): JsonResponse
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
            ->with(['hocVien:id,ho_ten', 'giasu.user:id,ho_ten'])
            ->whereIn('trang_thai', ['cho_xacnhan', 'cho_thanhtoan'])
            ->find($goiHocId);

        if (! $goiHoc) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay goi hoc co the huy.',
            ], 404);
        }

        DB::transaction(function () use ($request, $duLieu, $goiHoc) {
            $goiHoc->update([
                'trang_thai' => 'dahuy',
            ]);

            $goiHoc->lichHocs()->update([
                'trang_thai' => 'dahuy',
                'lydo_huy' => filled($duLieu['ly_do'] ?? null) ? trim($duLieu['ly_do']) : null,
            ]);

            ThongBao::create([
                'user_id' => $goiHoc->hocvien_id,
                'tieu_de' => 'Gói học đã bị hủy',
                'noi_dung' => 'Yêu cầu đặt gói của bạn đã bị hủy' . (filled($duLieu['ly_do'] ?? null) ? ': ' . trim($duLieu['ly_do']) : '.'),
                'url' => '/hoc-vien/lich-hoc',
                'da_doc' => false,
            ]);

            if ($goiHoc->giasu?->user_id) {
                ThongBao::create([
                    'user_id' => $goiHoc->giasu->user_id,
                    'tieu_de' => 'Yêu cầu đặt gói đã bị hủy',
                    'noi_dung' => 'Yêu cầu đặt gói ' . 'GH' . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT)
                        . ' đã bị admin hủy' . (filled($duLieu['ly_do'] ?? null) ? ': ' . trim($duLieu['ly_do']) : '.'),
                    'url' => '/gia-su/quan-ly/lich-day',
                    'da_doc' => false,
                ]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Da huy yeu cau dat goi.',
            'data' => $this->dinhDangGoiHocChoAdmin($goiHoc->fresh(['hocVien', 'monHoc', 'giasu.user', 'lichHocs', 'phanHoiMoiNhat', 'thanhToanMoiNhat'])),
        ]);
    }
}

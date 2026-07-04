<?php

namespace App\Http\Controllers\Api\LichHoc;

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

class AdminLichHocController extends DatLichBaseController
{
    public function danhSachLichHocAdmin(Request $request): JsonResponse
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Ban khong co quyen truy cap.',
            ], 403);
        }

        $trangThai = $request->query('trang_thai');
        $tuNgay = $request->query('tu_ngay');
        $denNgay = $request->query('den_ngay');
        $tuKhoa = trim((string) $request->query('q', ''));

        $query = LichHoc::query()
            ->with([
                'goiHoc:id,hocvien_id,giasu_id,monhoc_id,loai_goi_id,ngay_batdau,ngay_ketthuc,so_buoi,hoc_dinhky,kieu_goi,tong_tien,trang_thai',
                'goiHoc.hocVien:id,ho_ten,email,sdt',
                'goiHoc.monHoc:id,ten_mon,lop',
                'goiHoc.loaiGoi:id,ten_loai_goi,so_thang',
                'giasu:id,user_id',
                'giasu.user:id,ho_ten,email,sdt',
                'danhGia:id,lichhoc_id,so_sao,noi_dung,created_at',
            ])
            ->when($tuNgay, fn ($lichQuery) => $lichQuery->whereDate('ngay_hoc', '>=', $tuNgay))
            ->when($denNgay, fn ($lichQuery) => $lichQuery->whereDate('ngay_hoc', '<=', $denNgay))
            ->when($tuKhoa !== '', function ($lichQuery) use ($tuKhoa) {
                $lichQuery->where(function ($subQuery) use ($tuKhoa) {
                    $subQuery
                        ->whereHas('goiHoc.hocVien', fn ($userQuery) => $userQuery
                            ->where('ho_ten', 'like', "%{$tuKhoa}%")
                            ->orWhere('email', 'like', "%{$tuKhoa}%")
                            ->orWhere('sdt', 'like', "%{$tuKhoa}%"))
                        ->orWhereHas('giasu.user', fn ($userQuery) => $userQuery
                            ->where('ho_ten', 'like', "%{$tuKhoa}%")
                            ->orWhere('email', 'like', "%{$tuKhoa}%")
                            ->orWhere('sdt', 'like', "%{$tuKhoa}%"))
                        ->orWhereHas('goiHoc.monHoc', fn ($monQuery) => $monQuery
                            ->where('ten_mon', 'like', "%{$tuKhoa}%")
                            ->orWhere('lop', 'like', "%{$tuKhoa}%"));
                });
            });

        $thongKe = [
            'tat_ca' => (clone $query)->count(),
            'cho_xacnhan' => (clone $query)->where('trang_thai', 'cho_xacnhan')->count(),
            'da_nhan' => (clone $query)->where('trang_thai', 'da_nhan')->count(),
            'hoanthanh' => (clone $query)->where('trang_thai', 'hoanthanh')->count(),
            'dahuy' => (clone $query)->where('trang_thai', 'dahuy')->count(),
        ];

        if ($trangThai) {
            $query->where('trang_thai', $trangThai);
        }

        $danhSach = $query
            ->orderByDesc('ngay_hoc')
            ->orderByDesc('gio_batdau')
            ->limit(300)
            ->get()
            ->map(fn (LichHoc $lichHoc) => $this->dinhDangLichHocAdmin($lichHoc))
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'thong_ke' => $thongKe,
                'danh_sach' => $danhSach,
            ],
        ]);
    }
    public function adminXacNhanHoanThanhLichHoc(Request $request, int $lichHocId): JsonResponse
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Ban khong co quyen truy cap.',
            ], 403);
        }

        $duLieu = $request->validate([
            'ghi_chu' => ['nullable', 'string', 'max:1000'],
        ]);

        $lichHoc = LichHoc::query()
            ->with(['goiHoc.hocVien:id,ho_ten', 'giasu.user:id,ho_ten'])
            ->find($lichHocId);

        if (! $lichHoc) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay buoi hoc.',
            ], 404);
        }

        if ($lichHoc->trang_thai === 'dahuy') {
            return response()->json([
                'success' => false,
                'message' => 'Buoi hoc da huy, khong the xac nhan hoan thanh.',
            ], 422);
        }

        if ($lichHoc->trang_thai === 'hoanthanh') {
            return response()->json([
                'success' => false,
                'message' => 'Buoi hoc da hoan thanh.',
            ], 422);
        }

        $xacNhan = $this->thongTinXacNhanLichHoc($lichHoc);
        if (! $xacNhan['duHaiBenXacNhan']) {
            return response()->json([
                'success' => false,
                'message' => 'Can hoc vien va gia su cung xac nhan hoan thanh truoc khi admin xu ly.',
            ], 422);
        }

        if ($xacNhan['coBaoVanDe']) {
            return response()->json([
                'success' => false,
                'message' => 'Buoi hoc dang co bao van de, admin can kiem tra va khong the xac nhan hoan thanh truc tiep.',
            ], 422);
        }

        DB::transaction(function () use ($duLieu, $lichHoc) {
            $ghiChu = $this->themDongGhiChu(
                $lichHoc->ghi_chu,
                'Admin xác nhận hoàn thành',
                $duLieu['ghi_chu'] ?? null,
            );

            $lichHoc->update([
                'trang_thai' => 'hoanthanh',
                'ghi_chu' => $ghiChu,
            ]);

            $goiHoc = $lichHoc->goiHoc;
            if ($goiHoc && ! $goiHoc->lichHocs()->whereNotIn('trang_thai', ['hoanthanh', 'dahuy'])->exists()) {
                $goiHoc->update(['trang_thai' => 'hoanthanh']);
            }
        });

        $this->guiThongBaoXuLyLichHoc($lichHoc->fresh(), 'Buoi hoc da duoc xac nhan hoan thanh');

        return response()->json([
            'success' => true,
            'message' => 'Da xac nhan hoan thanh buoi hoc.',
            'data' => $this->dinhDangLichHocAdmin($this->taiLichHocAdmin($lichHocId)),
        ]);
    }
    public function adminHuyLichHoc(Request $request, int $lichHocId): JsonResponse
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Ban khong co quyen truy cap.',
            ], 403);
        }

        $duLieu = $request->validate([
            'ly_do' => ['required', 'string', 'max:1000'],
        ]);

        $lichHoc = LichHoc::query()
            ->with(['goiHoc.hocVien:id,ho_ten', 'giasu.user:id,ho_ten'])
            ->find($lichHocId);

        if (! $lichHoc) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay buoi hoc.',
            ], 404);
        }

        if ($lichHoc->trang_thai === 'hoanthanh') {
            return response()->json([
                'success' => false,
                'message' => 'Buoi hoc da hoan thanh, khong the huy.',
            ], 422);
        }

        $lyDo = trim($duLieu['ly_do']);

        $lichHoc->update([
            'trang_thai' => 'dahuy',
            'lydo_huy' => $lyDo,
            'ghi_chu' => $this->themDongGhiChu($lichHoc->ghi_chu, 'Admin hủy buổi học', $lyDo),
        ]);

        $this->guiThongBaoXuLyLichHoc($lichHoc->fresh(), 'Buoi hoc da bi huy');

        return response()->json([
            'success' => true,
            'message' => 'Da huy buoi hoc.',
            'data' => $this->dinhDangLichHocAdmin($this->taiLichHocAdmin($lichHocId)),
        ]);
    }
}

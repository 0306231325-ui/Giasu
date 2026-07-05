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

class GiaSuLichHocController extends DatLichBaseController
{
    public function lichDayGiaSu(Request $request): JsonResponse
    {
        $giaSu = $this->layGiaSuDangNhap($request);

        if (! $giaSu) {
            return response()->json([
                'success' => false,
                'message' => 'Khu vuc nay chi danh cho tai khoan gia su.',
            ], 403);
        }

        $danhSach = LichHoc::query()
            ->with([
                'goiHoc.hocVien:id,ho_ten,email,sdt',
                'goiHoc.monHoc:id,ten_mon,lop',
                'goiHoc.phanHoiMoiNhat',
            ])
            ->where('giasu_id', $giaSu->id)
            ->whereHas('goiHoc', fn ($query) => $query->whereIn('trang_thai', ['danghoc', 'hoanthanh']))
            ->orderBy('ngay_hoc')
            ->orderBy('gio_batdau')
            ->get()
            ->map(fn (LichHoc $lichHoc) => $this->dinhDangLichDayChoGiaSu($lichHoc))
            ->values();

        return response()->json([
            'success' => true,
            'data' => $danhSach,
        ]);
    }
    public function giaSuXacNhanHoanThanhBuoiHoc(Request $request, int $lichHocId): JsonResponse
    {
        $user = $request->user();

        if ($user->vai_tro !== 'giasu') {
            return response()->json([
                'success' => false,
                'message' => 'Chuc nang xac nhan buoi hoc chi danh cho tai khoan gia su.',
            ], 403);
        }

        $giaSuId = $user->giasu?->id;
        if (! $giaSuId) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay ho so gia su cua ban.',
            ], 404);
        }

        $duLieu = $request->validate([
            'trang_thai' => ['required', Rule::in(['daxacnhan', 'baovan_de'])],
            'ghi_chu' => ['required_if:trang_thai,baovan_de', 'nullable', 'string', 'max:1000'],
        ]);

        $lichHoc = LichHoc::query()
            ->with([
                'goiHoc.hocVien:id,ho_ten',
                'goiHoc.monHoc:id,ten_mon,lop',
                'giasu.user:id,ho_ten',
            ])
            ->where('giasu_id', $giaSuId)
            ->find($lichHocId);

        if (! $lichHoc) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay buoi hoc cua ban.',
            ], 404);
        }

        if (in_array($lichHoc->trang_thai, ['hoanthanh', 'dahuy'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Buoi hoc nay khong con can xac nhan.',
            ], 422);
        }

        if ($lichHoc->trang_thai !== 'da_nhan') {
            return response()->json([
                'success' => false,
                'message' => 'Buoi hoc chua o trang thai co the xac nhan.',
            ], 422);
        }

        $thoiDiemBatDau = Carbon::parse($lichHoc->ngay_hoc . ' ' . $lichHoc->gio_batdau);
        if (now()->lt($thoiDiemBatDau)) {
            return response()->json([
                'success' => false,
                'message' => 'Chi co the xac nhan khi buoi hoc da bat dau.',
            ], 422);
        }

        $xacNhan = $this->thongTinXacNhanLichHoc($lichHoc);
        if ($xacNhan['giaSuDaXacNhan'] || $xacNhan['giaSuBaoVanDe']) {
            return response()->json([
                'success' => false,
                'message' => 'Ban da gui xac nhan cho buoi hoc nay.',
            ], 422);
        }

        $trangThaiXacNhan = $duLieu['trang_thai'];
        $lichHoc->update([
            'ghi_chu' => $this->themDongGhiChu(
                $lichHoc->ghi_chu,
                $trangThaiXacNhan === 'baovan_de' ? self::DAU_GIASU_BAO_VAN_DE : self::DAU_GIASU_XACNHAN,
                $duLieu['ghi_chu'] ?? null,
            ),
        ]);

        if ($lichHoc->goiHoc?->hocvien_id) {
            ThongBao::create([
                'user_id' => $lichHoc->goiHoc->hocvien_id,
                'tieu_de' => $trangThaiXacNhan === 'baovan_de'
                    ? 'Gia sư báo vấn đề buổi học'
                    : 'Gia sư đã xác nhận buổi học',
                'noi_dung' => $trangThaiXacNhan === 'baovan_de'
                    ? "{$user->ho_ten} đã báo có vấn đề với buổi học."
                    : "{$user->ho_ten} đã xác nhận đã dạy xong buổi học.",
                'url' => '/hoc-vien/lich-hoc',
                'da_doc' => false,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => $trangThaiXacNhan === 'baovan_de'
                ? 'Da ghi nhan van de cua buoi hoc. Admin se kiem tra tren trang quan ly lich hoc.'
                : 'Da ghi nhan xac nhan cua gia su. Admin se xu ly sau khi hoc vien cung xac nhan.',
            'data' => $this->dinhDangLichDayChoGiaSu($lichHoc->fresh([
                'goiHoc.hocVien:id,ho_ten',
                'goiHoc.monHoc:id,ten_mon,lop',
                'giasu.user:id,ho_ten',
            ])),
        ]);
    }
}

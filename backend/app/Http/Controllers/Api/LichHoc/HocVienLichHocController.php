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

class HocVienLichHocController extends DatLichBaseController
{
    public function lichHocCuaToi(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->vai_tro !== 'hocvien') {
            return response()->json([
                'success' => false,
                'message' => 'Khu vuc nay chi danh cho tai khoan hoc vien.',
            ], 403);
        }

        $danhSach = GoiHoc::query()
            ->with([
                'monHoc:id,ten_mon,lop',
                'giasu.user:id,ho_ten',
                'lichHocs' => fn ($query) => $query
                    ->with(['danhGia', 'yeuCauHocBus' => fn ($yeuCau) => $yeuCau->latest()])
                    ->orderBy('ngay_hoc')
                    ->orderBy('gio_batdau'),
                'thanhToanMoiNhat',
            ])
            ->where('hocvien_id', $user->id)
            ->latest()
            ->get()
            ->map(fn (GoiHoc $goiHoc) => $this->dinhDangGoiHocChoHocVien($goiHoc))
            ->values();

        return response()->json([
            'success' => true,
            'data' => $danhSach,
        ]);
    }
    public function danhGiaBuoiHoc(Request $request, int $lichHocId): JsonResponse
    {
        $user = $request->user();

        if ($user->vai_tro !== 'hocvien') {
            return response()->json([
                'success' => false,
                'message' => 'Chuc nang danh gia chi danh cho tai khoan hoc vien.',
            ], 403);
        }

        $duLieu = $request->validate([
            'so_sao' => ['required', 'integer', 'min:1', 'max:5'],
            'noi_dung' => ['nullable', 'string', 'max:1000'],
        ]);

        $lichHoc = LichHoc::query()
            ->with(['goiHoc', 'danhGia'])
            ->whereHas('goiHoc', fn ($query) => $query->where('hocvien_id', $user->id))
            ->find($lichHocId);

        if (! $lichHoc) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay buoi hoc cua ban.',
            ], 404);
        }

        if ($lichHoc->trang_thai !== 'hoanthanh') {
            return response()->json([
                'success' => false,
                'message' => 'Chi co the danh gia sau khi buoi hoc hoan thanh.',
            ], 422);
        }

        $danhGia = DanhGia::query()->updateOrCreate(
            ['lichhoc_id' => $lichHoc->id],
            [
                'user_id' => $user->id,
                'so_sao' => $duLieu['so_sao'],
                'noi_dung' => filled($duLieu['noi_dung'] ?? null) ? trim($duLieu['noi_dung']) : null,
            ],
        );

        if ($lichHoc->giasu?->user_id) {
            ThongBao::create([
                'user_id' => $lichHoc->giasu->user_id,
                'tieu_de' => 'Hoc vien da danh gia buoi hoc',
                'noi_dung' => "{$user->ho_ten} da danh gia {$duLieu['so_sao']} sao cho buoi hoc.",
                'url' => '/gia-su/quan-ly/theo-doi-hoat-dong',
                'da_doc' => false,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Da luu danh gia buoi hoc.',
            'data' => $this->dinhDangDanhGia($danhGia),
        ]);
    }
    public function hocVienXacNhanHoanThanhBuoiHoc(Request $request, int $lichHocId): JsonResponse
    {
        $user = $request->user();

        if ($user->vai_tro !== 'hocvien') {
            return response()->json([
                'success' => false,
                'message' => 'Chuc nang xac nhan buoi hoc chi danh cho tai khoan hoc vien.',
            ], 403);
        }

        $duLieu = $request->validate([
            'trang_thai' => ['required', Rule::in(['daxacnhan', 'baovan_de'])],
            'ghi_chu' => ['required_if:trang_thai,baovan_de', 'nullable', 'string', 'max:1000'],
        ]);

        $lichHoc = LichHoc::query()
            ->with([
                'goiHoc',
                'giasu.user:id,ho_ten',
                'danhGia',
                'yeuCauHocBus' => fn ($query) => $query->latest(),
            ])
            ->whereHas('goiHoc', fn ($query) => $query->where('hocvien_id', $user->id))
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

        $trangThaiXacNhan = $duLieu['trang_thai'];
        $ghiChuCu = trim((string) $lichHoc->ghi_chu);
        $ghiChuMoi = $trangThaiXacNhan === 'baovan_de'
            ? trim($ghiChuCu . "\n\n[Học viên báo vấn đề] " . trim((string) ($duLieu['ghi_chu'] ?? '')))
            : $ghiChuCu;

        $xacNhan = $this->thongTinXacNhanLichHoc($lichHoc);
        if ($xacNhan['hocVienDaXacNhan'] || $xacNhan['hocVienBaoVanDe']) {
            return response()->json([
                'success' => false,
                'message' => 'Ban da gui xac nhan cho buoi hoc nay.',
            ], 422);
        }

        $ghiChuMoi = $this->themDongGhiChu(
            $lichHoc->ghi_chu,
            $trangThaiXacNhan === 'baovan_de' ? self::DAU_HOCVIEN_BAO_VAN_DE : self::DAU_HOCVIEN_XACNHAN,
            $duLieu['ghi_chu'] ?? null,
        );

        $lichHoc->update([
            'ghi_chu' => $ghiChuMoi !== '' ? $ghiChuMoi : null,
        ]);

        if ($lichHoc->giasu?->user_id) {
            ThongBao::create([
                'user_id' => $lichHoc->giasu->user_id,
                'tieu_de' => $trangThaiXacNhan === 'baovan_de'
                    ? 'Hoc vien bao van de buoi hoc'
                    : 'Hoc vien da xac nhan buoi hoc',
                'noi_dung' => $trangThaiXacNhan === 'baovan_de'
                    ? "{$user->ho_ten} da bao co van de voi buoi hoc."
                    : "{$user->ho_ten} da xac nhan da hoc xong buoi hoc.",
                'url' => '/gia-su/quan-ly/lich-day',
                'da_doc' => false,
            ]);
        }

        $lichHoc->refresh()->load([
            'goiHoc.monHoc',
            'giasu.user',
            'danhGia',
            'yeuCauHocBus' => fn ($query) => $query->latest(),
        ]);

        return response()->json([
            'success' => true,
            'message' => $trangThaiXacNhan === 'baovan_de'
                ? 'Da ghi nhan van de cua buoi hoc. Admin se kiem tra tren trang quan ly lich hoc.'
                : 'Da xac nhan hoan thanh buoi hoc.',
            'data' => $this->dinhDangLichHoc($lichHoc),
        ]);
    }
    public function yeuCauDoiBuoiHoc(Request $request, int $lichHocId): JsonResponse
    {
        $user = $request->user();

        if ($user->vai_tro !== 'hocvien') {
            return response()->json([
                'success' => false,
                'message' => 'Chuc nang doi buoi chi danh cho tai khoan hoc vien.',
            ], 403);
        }

        $duLieu = $request->validate([
            'ngay_hoc' => ['required', 'date', 'after_or_equal:today'],
            'gio_batdau' => ['required', 'date_format:H:i'],
            'gio_ketthuc' => ['required', 'date_format:H:i', 'after:gio_batdau'],
            'ly_do' => ['required', 'string', 'max:1000'],
        ]);

        $lichHoc = LichHoc::query()
            ->with(['goiHoc', 'yeuCauHocBus'])
            ->whereHas('goiHoc', fn ($query) => $query->where('hocvien_id', $user->id))
            ->whereIn('trang_thai', ['cho_xacnhan', 'da_nhan'])
            ->find($lichHocId);

        if (! $lichHoc) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay buoi hoc co the yeu cau doi.',
            ], 404);
        }

        $yeuCauDangCho = $lichHoc->yeuCauHocBus()
            ->where('trang_thai', 'cho_duyet')
            ->exists();

        if ($yeuCauDangCho) {
            return response()->json([
                'success' => false,
                'message' => 'Buoi hoc nay dang co yeu cau doi lich cho duyet.',
            ], 422);
        }

        $yeuCau = YeuCauHocBu::create([
            'lichhoc_goc_id' => $lichHoc->id,
            'giasu_id' => $lichHoc->giasu_id,
            'nguoi_yeu_cau_id' => $user->id,
            'ngay_yeu_cau' => now(),
            'ngay_hoc' => $duLieu['ngay_hoc'],
            'gio_batdau' => $duLieu['gio_batdau'],
            'gio_ketthuc' => $duLieu['gio_ketthuc'],
            'ly_do' => trim($duLieu['ly_do']),
            'trang_thai' => 'cho_duyet',
        ]);

        if ($lichHoc->giasu?->user_id) {
            ThongBao::create([
                'user_id' => $lichHoc->giasu->user_id,
                'tieu_de' => 'Hoc vien yeu cau doi buoi hoc',
                'noi_dung' => "{$user->ho_ten} muon doi buoi hoc sang {$duLieu['ngay_hoc']} {$duLieu['gio_batdau']} - {$duLieu['gio_ketthuc']}.",
                'url' => '/gia-su/quan-ly/lich-day',
                'da_doc' => false,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Da gui yeu cau doi buoi hoc. Vui long cho gia su/admin duyet.',
            'data' => $this->dinhDangYeuCauHocBu($yeuCau),
        ], 201);
    }
}

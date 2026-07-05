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

class DatGoiController extends DatLichBaseController
{
    public function danhSachLoaiGoi(): JsonResponse
    {
        $danhSach = LoaiGoi::query()
            ->where('so_thang', '>', 0)
            ->orderBy('so_thang')
            ->orderBy('id')
            ->get()
            ->map(fn (LoaiGoi $loaiGoi) => [
                'id' => $loaiGoi->id,
                'ten' => $loaiGoi->ten_loai_goi ?: "Goi {$loaiGoi->so_thang} thang",
                'soThang' => (int) $loaiGoi->so_thang,
                'giamGia' => (float) $loaiGoi->phan_tram_giam,
                'moTa' => $loaiGoi->mo_ta,
                'soBuoiMoiThang' => 8,
                'phuHop' => $loaiGoi->phan_tram_giam > 0
                    ? 'Tiet kiem hoc phi'
                    : 'Hoc thu nghiem tuc',
            ])
            ->values();

        return response()->json([
            'success' => true,
            'data' => $danhSach,
        ]);
    }
    public function lichBanGiaSu(Request $request, int $giaSuId): JsonResponse
    {
        $tuNgay = $request->query('tu_ngay', now()->toDateString());
        $denNgay = $request->query('den_ngay', now()->addMonths(3)->toDateString());

        $giaSu = Giasu::query()
            ->where('trang_thai_ho_so', 'duyet')
            ->find($giaSuId);

        if (! $giaSu) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay gia su phu hop.',
            ], 404);
        }

        $lichBan = LichHoc::query()
            ->where('giasu_id', $giaSu->id)
            ->whereBetween('ngay_hoc', [$tuNgay, $denNgay])
            ->where('trang_thai', '!=', 'dahuy')
            ->whereHas('goiHoc', fn ($query) => $this->apDungDieuKienLichDaDuocGiu($query))
            ->orderBy('ngay_hoc')
            ->orderBy('gio_batdau')
            ->get(['id', 'ngay_hoc', 'gio_batdau', 'gio_ketthuc'])
            ->map(fn (LichHoc $lichHoc) => [
                'id' => $lichHoc->id,
                'ngay_hoc' => Carbon::parse($lichHoc->ngay_hoc)->toDateString(),
                'gio_batdau' => substr((string) $lichHoc->gio_batdau, 0, 5),
                'gio_ketthuc' => substr((string) $lichHoc->gio_ketthuc, 0, 5),
            ])
            ->values();

        return response()->json([
            'success' => true,
            'data' => $lichBan,
        ]);
    }
    public function datLich(Request $request, int $giaSuId): JsonResponse
    {
        $user = $request->user();

        if ($user->vai_tro !== 'hocvien') {
            return response()->json([
                'success' => false,
                'message' => 'Chuc nang dat lich chi danh cho tai khoan hoc vien.',
            ], 403);
        }

        $duLieu = $request->validate([
            'monhoc_id' => ['required', 'integer', 'exists:monhoc,id'],
            'loai_goi' => ['required', Rule::in(['hoc_thu', 'dinh_ky', 'khong_dinh_ky'])],
            'loai_goi_id' => ['required_if:loai_goi,dinh_ky,khong_dinh_ky', 'nullable', 'integer', 'exists:loai_goi,id'],
            'goi_id' => ['nullable'],
            'ten_goi' => ['nullable', 'string', 'max:120'],
            'so_thang' => ['required', 'integer', 'min:1', 'max:12'],
            'so_buoi' => ['required', 'integer', 'min:1', 'max:120'],
            'giam_gia' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'ngay_batdau' => ['required', 'date'],
            'gio_batdau' => ['required_if:loai_goi,hoc_thu,dinh_ky', 'nullable', 'date_format:H:i'],
            'gio_ketthuc' => ['required_if:loai_goi,hoc_thu,dinh_ky', 'nullable', 'date_format:H:i'],
            'thu_hoc' => ['required_if:loai_goi,dinh_ky', 'array'],
            'thu_hoc.*' => ['integer', 'between:1,7'],
            'buoi_linh_hoat' => ['required_if:loai_goi,khong_dinh_ky', 'array'],
            'buoi_linh_hoat.*.ngay' => ['required_if:loai_goi,khong_dinh_ky', 'date'],
            'buoi_linh_hoat.*.gio_batdau' => ['required_if:loai_goi,khong_dinh_ky', 'date_format:H:i'],
            'buoi_linh_hoat.*.gio_ketthuc' => ['required_if:loai_goi,khong_dinh_ky', 'date_format:H:i'],
            'hinh_thuc_hoc' => ['required', Rule::in(['online', 'offline'])],
            'dia_chi_hoc' => ['nullable', 'string', 'max:255'],
        ]);

        if ($duLieu['hinh_thuc_hoc'] === 'offline' && blank($duLieu['dia_chi_hoc'] ?? null)) {
            return response()->json([
                'success' => false,
                'message' => 'Vui long nhap dia chi hoc tai nha.',
            ], 422);
        }

        $loaiGoi = null;
        if (in_array($duLieu['loai_goi'], ['dinh_ky', 'khong_dinh_ky'], true)) {
            $loaiGoi = LoaiGoi::query()->find($duLieu['loai_goi_id']);
            $duLieu['so_thang'] = (int) $loaiGoi->so_thang;
            $duLieu['so_buoi'] = $duLieu['so_thang'] * 8;
            $duLieu['giam_gia'] = (float) $loaiGoi->phan_tram_giam;
        }

        if ($duLieu['loai_goi'] === 'hoc_thu') {
            $loaiGoi = LoaiGoi::query()
                ->where('so_thang', 0)
                ->first();
            $duLieu['so_thang'] = 1;
            $duLieu['so_buoi'] = 1;
            $duLieu['giam_gia'] = 0;
        }

        $giaSu = Giasu::query()
            ->with('user:id,ho_ten')
            ->where('trang_thai_ho_so', 'duyet')
            ->find($giaSuId);

        if (! $giaSu) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay gia su phu hop.',
            ], 404);
        }

        $mucGia = GiasuGia::query()
            ->where('giasu_id', $giaSu->id)
            ->where('monhoc_id', $duLieu['monhoc_id'])
            ->where('trang_thai', GiasuGia::TRANG_THAI_DA_DUYET)
            ->first();

        if (! $mucGia) {
            return response()->json([
                'success' => false,
                'message' => 'Gia su nay chua co muc gia duoc duyet cho mon hoc da chon.',
            ], 422);
        }

        $this->kiemTraGoiHocTrung($user->id, $giaSu->id, (int) $duLieu['monhoc_id']);

        $lichHocNhap = $this->taoLichHocTuYeuCau($duLieu);

        if (count($lichHocNhap) !== (int) $duLieu['so_buoi']) {
            return response()->json([
                'success' => false,
                'message' => 'So buoi hoc khong khop voi goi da chon.',
            ], 422);
        }

        $this->kiemTraTrungLichDatGoi($user->id, $giaSu->id, $lichHocNhap);

        $laHocThu = $duLieu['loai_goi'] === 'hoc_thu';
        $giamGia = $laHocThu ? 0 : (float) ($duLieu['giam_gia'] ?? 0);
        $donGia = $laHocThu ? 0 : (float) $mucGia->tong_gia;
        $tongTruocGiam = collect($lichHocNhap)->sum(fn (array $lichHoc) => $donGia * $lichHoc['so_gio']);
        $tongTien = round($tongTruocGiam * (100 - $giamGia) / 100);
        $heSoGiam = $tongTruocGiam > 0 ? $tongTien / $tongTruocGiam : 1;

        $goiHoc = DB::transaction(function () use ($duLieu, $user, $giaSu, $mucGia, $lichHocNhap, $donGia, $tongTien, $heSoGiam, $loaiGoi) {
            $ngayBatDau = collect($lichHocNhap)->min('ngay_hoc');
            $ngayKetThuc = $duLieu['loai_goi'] === 'dinh_ky'
                ? Carbon::parse($ngayBatDau)
                    ->addDays(max(((int) $duLieu['so_thang']) * 30, 1) - 1)
                    ->toDateString()
                : collect($lichHocNhap)->max('ngay_hoc');

            $goiHoc = GoiHoc::create([
                'hocvien_id' => $user->id,
                'giasu_id' => $giaSu->id,
                'monhoc_id' => $duLieu['monhoc_id'],
                'giasu_gia_id' => $mucGia->id,
                'loai_goi_id' => $loaiGoi?->id,
                'ngay_batdau' => $ngayBatDau,
                'ngay_ketthuc' => $ngayKetThuc,
                'so_buoi' => count($lichHocNhap),
                'hoc_dinhky' => $duLieu['loai_goi'] === 'dinh_ky',
                'kieu_goi' => $duLieu['loai_goi'],
                'thu' => $duLieu['loai_goi'] === 'dinh_ky' ? ($duLieu['thu_hoc'][0] ?? null) : null,
                'gio_batdau' => in_array($duLieu['loai_goi'], ['hoc_thu', 'dinh_ky'], true) ? $duLieu['gio_batdau'] : null,
                'gio_ketthuc' => in_array($duLieu['loai_goi'], ['hoc_thu', 'dinh_ky'], true) ? $duLieu['gio_ketthuc'] : null,
                'dia_chi_hoc' => filled($duLieu['dia_chi_hoc'] ?? null) ? trim($duLieu['dia_chi_hoc']) : null,
                'hinh_thuc_hoc' => $duLieu['hinh_thuc_hoc'],
                'don_gia_theogio' => $donGia,
                'tong_tien' => $tongTien,
                'trang_thai' => 'cho_xacnhan',
            ]);

            foreach ($lichHocNhap as $lichHoc) {
                $tienHoc = round($donGia * $lichHoc['so_gio'] * $heSoGiam);
                $phiHoaHong = round($tienHoc * 0.2);

                LichHoc::create([
                    'goihoc_id' => $goiHoc->id,
                    'giasu_id' => $giaSu->id,
                    'loai_buoi' => 'hoc_thuong',
                    'ngay_hoc' => $lichHoc['ngay_hoc'],
                    'gio_batdau' => $lichHoc['gio_batdau'],
                    'gio_ketthuc' => $lichHoc['gio_ketthuc'],
                    'dia_chi_hoc' => filled($duLieu['dia_chi_hoc'] ?? null) ? trim($duLieu['dia_chi_hoc']) : null,
                    'hinh_thuc_hoc' => $duLieu['hinh_thuc_hoc'],
                    'tien_hoc' => $tienHoc,
                    'phi_hoahong' => $phiHoaHong,
                    'tien_giasu_nhan' => max($tienHoc - $phiHoaHong, 0),
                    'trang_thai' => 'cho_xacnhan',
                ]);
            }

            User::query()
                ->where('vai_tro', 'admin')
                ->get(['id'])
                ->each(fn (User $admin) => ThongBao::create([
                    'user_id' => $admin->id,
                    'tieu_de' => 'Có yêu cầu đặt gói mới',
                    'noi_dung' => "{$user->ho_ten} vừa gửi yêu cầu đặt " . count($lichHocNhap) . ' buổi học. Vui lòng kiểm tra và gửi cho gia sư.',
                    'url' => '/admin/quan-ly-dat-goi',
                    'da_doc' => false,
                ]));

            return $goiHoc->load(['monHoc:id,ten_mon,lop', 'giasu.user:id,ho_ten', 'lichHocs']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Da tao goi hoc va lich hoc. Vui long cho gia su xac nhan.',
            'data' => $this->dinhDangGoiHoc($goiHoc),
        ], 201);
    }
    public function hocVienHuyGoiHoc(Request $request, int $goiHocId): JsonResponse
    {
        $user = $request->user();

        if ($user->vai_tro !== 'hocvien') {
            return response()->json([
                'success' => false,
                'message' => 'Chuc nang huy goi chi danh cho tai khoan hoc vien.',
            ], 403);
        }

        $goiHoc = GoiHoc::query()
            ->with(['hocVien:id,ho_ten', 'giasu.user:id,ho_ten', 'monHoc:id,ten_mon,lop', 'lichHocs', 'thanhToanMoiNhat'])
            ->where('hocvien_id', $user->id)
            ->where('trang_thai', 'cho_xacnhan')
            ->find($goiHocId);

        if (! $goiHoc) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay goi hoc co the huy.',
            ], 404);
        }

        $goiHocMoi = DB::transaction(function () use ($goiHoc, $user) {
            $lyDo = 'Học viên tự hủy gói học.';

            $goiHoc->update(['trang_thai' => 'dahuy']);
            $goiHoc->lichHocs()->update([
                'trang_thai' => 'dahuy',
                'lydo_huy' => $lyDo,
            ]);

            User::query()
                ->where('vai_tro', 'admin')
                ->get(['id'])
                ->each(fn (User $admin) => ThongBao::create([
                    'user_id' => $admin->id,
                    'tieu_de' => 'Học viên hủy gói học',
                    'noi_dung' => "{$user->ho_ten} đã hủy gói học GH" . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT) . '.',
                    'url' => '/admin/quan-ly-dat-goi',
                    'da_doc' => false,
                ]));

            if ($goiHoc->giasu?->user_id) {
                ThongBao::create([
                    'user_id' => $goiHoc->giasu->user_id,
                    'tieu_de' => 'Học viên hủy yêu cầu đặt gói',
                    'noi_dung' => "{$user->ho_ten} đã hủy gói học GH" . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT) . '.',
                    'url' => '/gia-su/quan-ly/lich-day',
                    'da_doc' => false,
                ]);
            }

            return $goiHoc->fresh(['hocVien:id,ho_ten', 'giasu.user:id,ho_ten', 'monHoc:id,ten_mon,lop', 'lichHocs', 'thanhToanMoiNhat']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Da huy goi hoc.',
            'data' => $this->dinhDangGoiHocChoHocVien($goiHocMoi),
        ]);
    }
}

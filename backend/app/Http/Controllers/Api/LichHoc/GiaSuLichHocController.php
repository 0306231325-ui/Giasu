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
use App\Services\NhatKyHeThongService;
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
                'goiHoc.monHoc:id,ten_mon,lop,cap_hoc_id',
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

    public function capNhatLinkHocOnline(Request $request, int $lichHocId): JsonResponse
    {
        $giaSu = $this->layGiaSuDangNhap($request);

        if (! $giaSu) {
            return response()->json([
                'success' => false,
                'message' => 'Khu vực này chỉ dành cho tài khoản gia sư.',
            ], 403);
        }

        $duLieu = $request->validate([
            'link_hoc_online' => ['required', 'url', 'max:500'],
        ], [
            'link_hoc_online.required' => 'Vui lòng nhập link lớp học online.',
            'link_hoc_online.url' => 'Link lớp học phải là một đường dẫn hợp lệ.',
            'link_hoc_online.max' => 'Link lớp học không được vượt quá 500 ký tự.',
        ]);

        $lichHoc = LichHoc::query()
            ->with([
                'goiHoc.hocVien:id,ho_ten',
                'goiHoc.monHoc:id,ten_mon,lop,cap_hoc_id',
                'giasu.user:id,ho_ten',
            ])
            ->where('giasu_id', $giaSu->id)
            ->find($lichHocId);

        if (! $lichHoc) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy buổi học của bạn.',
            ], 404);
        }

        if ($lichHoc->hinh_thuc_hoc !== 'online') {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ buổi học online mới cần cập nhật link lớp học.',
            ], 422);
        }

        if (in_array($lichHoc->trang_thai, ['hoanthanh', 'dahuy'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Buổi học này đã kết thúc hoặc đã hủy, không thể cập nhật link.',
            ], 422);
        }

        $lichHoc->update([
            'link_hoc_online' => $duLieu['link_hoc_online'],
        ]);

        NhatKyHeThongService::ghi(
            $request->user(),
            'cap_nhat_link_hoc_online',
            $lichHoc->id,
            "{$request->user()->ho_ten} cập nhật link lớp học online cho buổi học LH" . str_pad((string) $lichHoc->id, 6, '0', STR_PAD_LEFT) . "."
        );

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật link lớp học online.',
            'data' => $this->dinhDangLichDayChoGiaSu($lichHoc->fresh([
                'goiHoc.hocVien:id,ho_ten',
                'goiHoc.monHoc:id,ten_mon,lop,cap_hoc_id',
                'giasu.user:id,ho_ten',
            ])),
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
                'goiHoc.monHoc:id,ten_mon,lop,cap_hoc_id',
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

        //   them kiem tra ngay hoc cuar Gia su truoc khi xac nhan  3/7
        if (! $this->daDenNgayHoc($lichHoc)) {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ có thể xác nhận trong ngày học hoặc sau ngày học.',
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
                    : 'Gia sư đã xác nhận buổi học, Vào Xác Nhận Buổi Học Nhé',
                'noi_dung' => $trangThaiXacNhan === 'baovan_de'
                    ? "{$user->ho_ten} đã báo có vấn đề với buổi học."
                    : "{$user->ho_ten} đã xác nhận đã dạy xong buổi học.",
                'url' => '/hoc-vien/lich-hoc?mo_lich_hoc=' . $lichHoc->id,
                'da_doc' => false,
            ]);
        }

        NhatKyHeThongService::ghi(
            $user,
            'xac_nhan_hoan_thanh_buoi_hoc',
            $lichHoc->id,
            $trangThaiXacNhan === 'baovan_de'
                ? "{$user->ho_ten} báo vấn đề buổi học LH" . str_pad((string) $lichHoc->id, 6, '0', STR_PAD_LEFT) . "."
                : "{$user->ho_ten} xác nhận hoàn thành buổi học LH" . str_pad((string) $lichHoc->id, 6, '0', STR_PAD_LEFT) . "."
        );

        return response()->json([
            'success' => true,
            'message' => $trangThaiXacNhan === 'baovan_de'
                ? 'Da ghi nhan van de cua buoi hoc. Admin se kiem tra tren trang quan ly lich hoc.'
                : 'Đã Ghi Nhận Và Gửi Cho Học Viên Xác Nhận',
            'data' => $this->dinhDangLichDayChoGiaSu($lichHoc->fresh([
                'goiHoc.hocVien:id,ho_ten',
                'goiHoc.monHoc:id,ten_mon,lop,cap_hoc_id',
                'giasu.user:id,ho_ten',
            ])),
        ]);
    }

    public function danhSachYeuCauDoiBuoiGiaSu(Request $request): JsonResponse
    {
        $giaSu = $this->layGiaSuDangNhap($request);

        if (! $giaSu) {
            return response()->json([
                'success' => false,
                'message' => 'Khu vuc nay chi danh cho tai khoan gia su.',
            ], 403);
        }

        $danhSach = YeuCauHocBu::query()
            ->with($this->quanHeYeuCauDoiBuoi())
            ->where('giasu_id', $giaSu->id)
            ->whereIn('trang_thai', ['cho_gia_su_xac_nhan', 'giasu_dong_y', 'giasu_tu_choi', 'da_duyet', 'tu_choi'])
            ->orderByRaw("CASE trang_thai WHEN 'cho_gia_su_xac_nhan' THEN 1 ELSE 2 END")
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn (YeuCauHocBu $yeuCau) => $this->dinhDangYeuCauHocBu($yeuCau))
            ->values();

        return response()->json([
            'success' => true,
            'data' => $danhSach,
        ]);
    }

    public function phanHoiYeuCauDoiBuoiGiaSu(Request $request, int $yeuCauId): JsonResponse
    {
        $giaSu = $this->layGiaSuDangNhap($request);

        if (! $giaSu) {
            return response()->json([
                'success' => false,
                'message' => 'Khu vuc nay chi danh cho tai khoan gia su.',
            ], 403);
        }

        $duLieu = $request->validate([
            'phan_hoi' => ['required', Rule::in(['dong_y', 'tu_choi'])],
        ]);

        $yeuCau = YeuCauHocBu::query()
            ->with($this->quanHeYeuCauDoiBuoi())
            ->where('giasu_id', $giaSu->id)
            ->find($yeuCauId);

        if (! $yeuCau) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay yeu cau doi buoi.',
            ], 404);
        }

        if ($yeuCau->trang_thai !== 'cho_gia_su_xac_nhan') {
            return response()->json([
                'success' => false,
                'message' => 'Yeu cau nay khong con cho phan hoi.',
            ], 422);
        }

        if ($duLieu['phan_hoi'] === 'dong_y') {
            $loiTrungLich = $this->kiemTraTrungLichDoiBuoi($yeuCau);
            if ($loiTrungLich) {
                return response()->json([
                    'success' => false,
                    'message' => $loiTrungLich,
                ], 422);
            }

            DB::transaction(function () use ($request, $yeuCau) {
                $lichHocGoc = $yeuCau->lichHocGoc;
                $ghiChuDoiBuoi = 'Chuyen sang ' . Carbon::parse($yeuCau->ngay_hoc)->format('d/m/Y') . ' '
                    . substr((string) $yeuCau->gio_batdau, 0, 5) . ' - ' . substr((string) $yeuCau->gio_ketthuc, 0, 5);
                $trangThaiBuoiMoi = $lichHocGoc->trang_thai === 'dahuy'
                    ? 'dahuy'
                    : ($lichHocGoc->goiHoc && in_array($lichHocGoc->goiHoc->trang_thai, ['danghoc', 'hoanthanh'], true) ? 'da_nhan' : $lichHocGoc->trang_thai);

                LichHoc::create([
                    'goihoc_id' => $lichHocGoc->goihoc_id,
                    'giasu_id' => $lichHocGoc->giasu_id,
                    'loai_buoi' => $lichHocGoc->loai_buoi,
                    'ngay_hoc' => $yeuCau->ngay_hoc,
                    'gio_batdau' => $yeuCau->gio_batdau,
                    'gio_ketthuc' => $yeuCau->gio_ketthuc,
                    'dia_chi_hoc' => $lichHocGoc->dia_chi_hoc,
                    'hinh_thuc_hoc' => $lichHocGoc->hinh_thuc_hoc,
                    'tien_hoc' => $lichHocGoc->tien_hoc,
                    'phi_hoahong' => $lichHocGoc->phi_hoahong,
                    'tien_giasu_nhan' => $lichHocGoc->tien_giasu_nhan,
                    'trang_thai' => $trangThaiBuoiMoi,
                    'ghi_chu' => $this->themDongGhiChu(
                        $lichHocGoc->ghi_chu,
                        'Gia su duyet doi buoi',
                        'Tao buoi moi tu ' . ($lichHocGoc->ma ?? ('LH' . str_pad((string) $lichHocGoc->id, 6, '0', STR_PAD_LEFT))),
                    ),
                ]);

                $lichHocGoc->update([
                    'trang_thai' => 'dahuy',
                    'lydo_huy' => 'Da doi sang buoi moi: ' . $ghiChuDoiBuoi,
                    'ghi_chu' => $this->themDongGhiChu(
                        $lichHocGoc->ghi_chu,
                        'Gia su duyet doi buoi',
                        $ghiChuDoiBuoi,
                    ),
                ]);

                $yeuCau->update([
                    'trang_thai' => 'da_duyet',
                    'nguoi_duyet_id' => $request->user()->id,
                    'ngay_xu_ly' => now(),
                ]);
            });

            if ($yeuCau->lichHocGoc?->goiHoc?->hocvien_id) {
                ThongBao::create([
                    'user_id' => $yeuCau->lichHocGoc->goiHoc->hocvien_id,
                    'tieu_de' => 'Gia sư đồng ý đổi buổi học',
                    'noi_dung' => 'Gia sư đã đồng ý và lịch học mới đã được cập nhật.',
                    'url' => '/hoc-vien/lich-hoc',
                    'da_doc' => false,
                ]);
            }
        } else {
            $yeuCau->update([
                'trang_thai' => 'tu_choi',
                'nguoi_duyet_id' => $request->user()->id,
                'ngay_xu_ly' => now(),
            ]);

            if ($yeuCau->lichHocGoc?->goiHoc?->hocvien_id) {
                ThongBao::create([
                    'user_id' => $yeuCau->lichHocGoc->goiHoc->hocvien_id,
                    'tieu_de' => 'Gia sư từ chối đổi buổi học',
                    'noi_dung' => 'Gia sư đã từ chối yêu cầu đổi buổi học của bạn.',
                    'url' => '/hoc-vien/lich-hoc',
                    'da_doc' => false,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => $duLieu['phan_hoi'] === 'dong_y'
                ? 'Đã đồng ý và cập nhật lịch học.'
                : 'Đã từ chối yêu cầu đổi buổi học.',
            'data' => $this->dinhDangYeuCauHocBu($yeuCau->fresh($this->quanHeYeuCauDoiBuoi())),
        ]);
    }

    private function quanHeYeuCauDoiBuoi(): array
    {
        return [
            'lichHocGoc',
            'lichHocGoc.goiHoc.hocVien:id,ho_ten,email,sdt',
            'lichHocGoc.goiHoc.monHoc:id,ten_mon,lop,cap_hoc_id',
            'giasu:id,user_id',
            'giasu.user:id,ho_ten,email,sdt',
            'nguoiYeuCau:id,ho_ten,email,sdt',
        ];
    }

    private function kiemTraTrungLichDoiBuoi(YeuCauHocBu $yeuCau): ?string
    {
        $lichHocGoc = $yeuCau->lichHocGoc;
        if (! $lichHocGoc) {
            return 'Khong tim thay buoi hoc goc.';
        }

        $trungGiaSu = LichHoc::query()
            ->where('id', '<>', $lichHocGoc->id)
            ->where('giasu_id', $yeuCau->giasu_id)
            ->where('trang_thai', '<>', 'dahuy')
            ->whereDate('ngay_hoc', $yeuCau->ngay_hoc)
            ->where('gio_batdau', '<', $yeuCau->gio_ketthuc)
            ->where('gio_ketthuc', '>', $yeuCau->gio_batdau)
            ->exists();

        if ($trungGiaSu) {
            return 'Gia su da co lich trung khung gio moi.';
        }

        $hocVienId = $lichHocGoc->goiHoc?->hocvien_id;
        if (! $hocVienId) {
            return null;
        }

        $trungHocVien = LichHoc::query()
            ->where('id', '<>', $lichHocGoc->id)
            ->where('trang_thai', '<>', 'dahuy')
            ->whereHas('goiHoc', fn ($query) => $query->where('hocvien_id', $hocVienId))
            ->whereDate('ngay_hoc', $yeuCau->ngay_hoc)
            ->where('gio_batdau', '<', $yeuCau->gio_ketthuc)
            ->where('gio_ketthuc', '>', $yeuCau->gio_batdau)
            ->exists();

        return $trungHocVien ? 'Hoc vien da co lich trung khung gio moi.' : null;
    }
}

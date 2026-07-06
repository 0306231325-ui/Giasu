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
        $trangThaiGoiDaDuyet = ['cho_thanhtoan', 'danghoc', 'hoanthanh'];

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
            ->whereHas('goiHoc', fn ($goiQuery) => $goiQuery->whereIn('trang_thai', $trangThaiGoiDaDuyet))
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
            'cho_xacnhan' => $this->demLichHocTheoTrangThaiHieuLuc(clone $query, 'cho_xacnhan'),
            'da_nhan' => $this->demLichHocTheoTrangThaiHieuLuc(clone $query, 'da_nhan'),
            'hoanthanh' => (clone $query)->where('trang_thai', 'hoanthanh')->count(),
            'dahuy' => (clone $query)->where('trang_thai', 'dahuy')->count(),
        ];

        if ($trangThai) {
            $this->locLichHocTheoTrangThaiHieuLuc($query, $trangThai);
        }

        if ($trangThai) {
            $query
                ->orderBy('ngay_hoc')
                ->orderBy('gio_batdau');
        } else {
            $query
                ->orderByRaw("CASE WHEN trang_thai IN ('cho_xacnhan', 'da_nhan') THEN 0 ELSE 1 END")
                ->orderByRaw("CASE WHEN trang_thai IN ('cho_xacnhan', 'da_nhan') THEN ngay_hoc END ASC")
                ->orderByRaw("CASE WHEN trang_thai IN ('cho_xacnhan', 'da_nhan') THEN gio_batdau END ASC")
                ->orderByRaw("CASE WHEN trang_thai NOT IN ('cho_xacnhan', 'da_nhan') THEN ngay_hoc END DESC")
                ->orderByRaw("CASE WHEN trang_thai NOT IN ('cho_xacnhan', 'da_nhan') THEN gio_batdau END DESC")
                ->orderByRaw("CASE trang_thai WHEN 'cho_xacnhan' THEN 1 WHEN 'da_nhan' THEN 2 WHEN 'hoanthanh' THEN 3 WHEN 'dahuy' THEN 4 ELSE 5 END");
        }

        $danhSach = $query
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

    private function demLichHocTheoTrangThaiHieuLuc(Builder $query, string $trangThai): int
    {
        $this->locLichHocTheoTrangThaiHieuLuc($query, $trangThai);

        return $query->count();
    }

    private function locLichHocTheoTrangThaiHieuLuc(Builder $query, string $trangThai): void
    {
        if ($trangThai === 'da_nhan') {
            $query->where(function ($subQuery) {
                $subQuery
                    ->where('trang_thai', 'da_nhan')
                    ->orWhere(function ($activeQuery) {
                        $activeQuery
                            ->where('trang_thai', 'cho_xacnhan')
                            ->whereHas('goiHoc', fn ($goiQuery) => $goiQuery->whereIn('trang_thai', ['danghoc', 'hoanthanh']));
                    });
            });

            return;
        }

        if ($trangThai === 'cho_xacnhan') {
            $query
                ->where('trang_thai', 'cho_xacnhan')
                ->whereHas('goiHoc', fn ($goiQuery) => $goiQuery->whereNotIn('trang_thai', ['danghoc', 'hoanthanh']));

            return;
        }

        $query->where('trang_thai', $trangThai);
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

        $this->guiThongBaoXuLyLichHoc($lichHoc->fresh(), 'Buổi học đã được xác nhận hoàn thành');

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

        $this->guiThongBaoXuLyLichHoc($lichHoc->fresh(), 'Buổi học đã bị hủy');

        return response()->json([
            'success' => true,
            'message' => 'Da huy buoi hoc.',
            'data' => $this->dinhDangLichHocAdmin($this->taiLichHocAdmin($lichHocId)),
        ]);
    }

    public function danhSachYeuCauDoiBuoiAdmin(Request $request): JsonResponse
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Ban khong co quyen truy cap.',
            ], 403);
        }

        $trangThai = $request->query('trang_thai');

        $danhSach = YeuCauHocBu::query()
            ->with($this->quanHeYeuCauDoiBuoi())
            ->when($trangThai, fn ($query) => $query->where('trang_thai', $trangThai))
            ->orderByRaw("CASE trang_thai WHEN 'cho_duyet' THEN 1 WHEN 'giasu_dong_y' THEN 2 WHEN 'cho_gia_su_xac_nhan' THEN 3 WHEN 'giasu_tu_choi' THEN 4 ELSE 5 END")
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

    public function guiYeuCauDoiBuoiChoGiaSu(Request $request, int $yeuCauId): JsonResponse
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Ban khong co quyen truy cap.',
            ], 403);
        }

        $yeuCau = $this->taiYeuCauDoiBuoi($yeuCauId);
        if (! $yeuCau) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay yeu cau doi buoi.',
            ], 404);
        }

        if ($yeuCau->trang_thai !== 'cho_duyet') {
            return response()->json([
                'success' => false,
                'message' => 'Yeu cau nay khong o trang thai cho gui gia su.',
            ], 422);
        }

        $loiTrungLich = $this->kiemTraTrungLichDoiBuoi($yeuCau);
        if ($loiTrungLich) {
            return response()->json([
                'success' => false,
                'message' => $loiTrungLich,
            ], 422);
        }

        $yeuCau->update([
            'trang_thai' => 'cho_gia_su_xac_nhan',
            'nguoi_duyet_id' => $request->user()->id,
        ]);

        if ($yeuCau->giasu?->user_id) {
            ThongBao::create([
                'user_id' => $yeuCau->giasu->user_id,
                'tieu_de' => 'Yeu cau doi buoi can phan hoi',
                'noi_dung' => 'Admin da gui yeu cau doi buoi hoc cho ban xac nhan.',
                'url' => '/gia-su/quan-ly/lich-day',
                'da_doc' => false,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Da gui yeu cau doi buoi cho gia su.',
            'data' => $this->dinhDangYeuCauHocBu($this->taiYeuCauDoiBuoi($yeuCauId)),
        ]);
    }

    public function duyetYeuCauDoiBuoi(Request $request, int $yeuCauId): JsonResponse
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Ban khong co quyen truy cap.',
            ], 403);
        }

        $yeuCau = $this->taiYeuCauDoiBuoi($yeuCauId);
        if (! $yeuCau || ! $yeuCau->lichHocGoc) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay yeu cau doi buoi.',
            ], 404);
        }

        if ($yeuCau->trang_thai !== 'giasu_dong_y') {
            return response()->json([
                'success' => false,
                'message' => 'Can gia su dong y truoc khi admin duyet doi buoi.',
            ], 422);
        }

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
                    'Admin duyet doi buoi',
                    'Tao buoi moi tu ' . ($lichHocGoc->ma ?? ('LH' . str_pad((string) $lichHocGoc->id, 6, '0', STR_PAD_LEFT))),
                ),
            ]);

            $lichHocGoc->update([
                'trang_thai' => 'dahuy',
                'lydo_huy' => 'Da doi sang buoi moi: ' . $ghiChuDoiBuoi,
                'ghi_chu' => $this->themDongGhiChu(
                    $lichHocGoc->ghi_chu,
                    'Admin duyet doi buoi',
                    $ghiChuDoiBuoi,
                ),
            ]);

            $yeuCau->update([
                'trang_thai' => 'da_duyet',
                'nguoi_duyet_id' => $request->user()->id,
                'ngay_xu_ly' => now(),
            ]);
        });

        $this->guiThongBaoYeuCauDoiBuoi($yeuCau->fresh($this->quanHeYeuCauDoiBuoi()), 'Yeu cau doi buoi da duoc duyet');

        return response()->json([
            'success' => true,
            'message' => 'Da duyet va cap nhat buoi hoc.',
            'data' => $this->dinhDangYeuCauHocBu($this->taiYeuCauDoiBuoi($yeuCauId)),
        ]);
    }

    public function tuChoiYeuCauDoiBuoi(Request $request, int $yeuCauId): JsonResponse
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Ban khong co quyen truy cap.',
            ], 403);
        }

        $yeuCau = $this->taiYeuCauDoiBuoi($yeuCauId);
        if (! $yeuCau) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay yeu cau doi buoi.',
            ], 404);
        }

        if (in_array($yeuCau->trang_thai, ['da_duyet', 'tu_choi'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Yeu cau nay da duoc xu ly.',
            ], 422);
        }

        $yeuCau->update([
            'trang_thai' => 'tu_choi',
            'nguoi_duyet_id' => $request->user()->id,
            'ngay_xu_ly' => now(),
        ]);

        $this->guiThongBaoYeuCauDoiBuoi($yeuCau->fresh($this->quanHeYeuCauDoiBuoi()), 'Yeu cau doi buoi da bi tu choi');

        return response()->json([
            'success' => true,
            'message' => 'Da tu choi yeu cau doi buoi.',
            'data' => $this->dinhDangYeuCauHocBu($this->taiYeuCauDoiBuoi($yeuCauId)),
        ]);
    }

    private function taiYeuCauDoiBuoi(int $yeuCauId): ?YeuCauHocBu
    {
        return YeuCauHocBu::query()
            ->with($this->quanHeYeuCauDoiBuoi())
            ->find($yeuCauId);
    }

    private function quanHeYeuCauDoiBuoi(): array
    {
        return [
            'lichHocGoc',
            'lichHocGoc.goiHoc.hocVien:id,ho_ten,email,sdt',
            'lichHocGoc.goiHoc.monHoc:id,ten_mon,lop',
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

    private function guiThongBaoYeuCauDoiBuoi(YeuCauHocBu $yeuCau, string $tieuDe): void
    {
        $noiDung = "{$tieuDe}: " . Carbon::parse($yeuCau->ngay_hoc)->format('d/m/Y')
            . ' ' . substr((string) $yeuCau->gio_batdau, 0, 5)
            . ' - ' . substr((string) $yeuCau->gio_ketthuc, 0, 5) . '.';

        foreach ([$yeuCau->lichHocGoc?->goiHoc?->hocvien_id, $yeuCau->giasu?->user_id] as $userId) {
            if (! $userId) {
                continue;
            }

            ThongBao::create([
                'user_id' => $userId,
                'tieu_de' => $tieuDe,
                'noi_dung' => $noiDung,
                'url' => $userId === $yeuCau->giasu?->user_id ? '/gia-su/quan-ly/lich-day' : '/hoc-vien/lich-hoc',
                'da_doc' => false,
            ]);
        }
    }
}

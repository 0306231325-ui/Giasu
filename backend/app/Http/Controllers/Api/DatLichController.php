<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class DatLichController extends Controller
{
    public function danhSachLoaiGoi(): JsonResponse
    {
        $danhSach = LoaiGoi::query()
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

        ThongBao::create([
            'user_id' => $goiHoc->giasu->user_id,
            'tieu_de' => 'Co yeu cau dat goi moi',
            'noi_dung' => ($goiHoc->hocVien?->ho_ten ?? 'Hoc vien') . ' da dat goi hoc va admin da chuyen cho ban xu ly.',
            'url' => '/gia-su/quan-ly/lich-day',
            'da_doc' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Da gui yeu cau dat goi cho gia su.',
            'data' => $this->dinhDangGoiHocChoAdmin($goiHoc->fresh(['hocVien', 'monHoc', 'giasu.user', 'lichHocs', 'phanHoiMoiNhat', 'thanhToanMoiNhat'])),
        ]);
    }

    public function danhSachYeuCauGiaSu(Request $request): JsonResponse
    {
        $giaSu = $this->layGiaSuDangNhap($request);

        if (! $giaSu) {
            return response()->json([
                'success' => false,
                'message' => 'Khu vuc nay chi danh cho tai khoan gia su.',
            ], 403);
        }

        $danhSach = GoiHoc::query()
            ->with([
                'hocVien:id,ho_ten,email,sdt',
                'monHoc:id,ten_mon,lop',
                'lichHocs' => fn ($query) => $query->orderBy('ngay_hoc')->orderBy('gio_batdau'),
                'phanHoiMoiNhat',
            ])
            ->where('giasu_id', $giaSu->id)
            ->where(function ($query) use ($giaSu) {
                $query
                    ->whereIn('trang_thai', ['cho_xacnhan', 'cho_thanhtoan'])
                    ->orWhere(function ($huyQuery) use ($giaSu) {
                        $huyQuery
                            ->where('trang_thai', 'dahuy')
                            ->whereHas('phanHois', function ($phanHoiQuery) use ($giaSu) {
                                $phanHoiQuery
                                    ->where('gia_su_id', $giaSu->id)
                                    ->where('phan_hoi', PhanHoi::TU_CHOI);
                            });
                    });
            })
            ->latest()
            ->get()
            ->map(fn (GoiHoc $goiHoc) => $this->dinhDangYeuCauChoGiaSu($goiHoc))
            ->values();

        return response()->json([
            'success' => true,
            'data' => $danhSach,
        ]);
    }

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

    public function phanHoiYeuCauGiaSu(Request $request, int $goiHocId): JsonResponse
    {
        $giaSu = $this->layGiaSuDangNhap($request);

        if (! $giaSu) {
            return response()->json([
                'success' => false,
                'message' => 'Khu vuc nay chi danh cho tai khoan gia su.',
            ], 403);
        }

        $duLieu = $request->validate([
            'phan_hoi' => ['required', Rule::in([PhanHoi::DONG_Y, PhanHoi::TU_CHOI])],
            'ly_do' => ['required_if:phan_hoi,' . PhanHoi::TU_CHOI, 'nullable', 'string', 'max:1000'],
        ]);

        $goiHoc = GoiHoc::query()
            ->with(['hocVien:id,ho_ten', 'monHoc:id,ten_mon,lop', 'giasu.user:id,ho_ten', 'lichHocs'])
            ->where('giasu_id', $giaSu->id)
            ->where('trang_thai', 'cho_xacnhan')
            ->find($goiHocId);

        if (! $goiHoc) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay yeu cau dang cho phan hoi.',
            ], 404);
        }

        $laTuChoi = $duLieu['phan_hoi'] === PhanHoi::TU_CHOI;
        $lyDo = filled($duLieu['ly_do'] ?? null) ? trim($duLieu['ly_do']) : null;

        DB::transaction(function () use ($goiHoc, $giaSu, $duLieu, $laTuChoi, $lyDo) {
            $phanHoiDaCo = PhanHoi::query()
                ->where('gia_su_id', $giaSu->id)
                ->where('goi_hoc_id', $goiHoc->id)
                ->lockForUpdate()
                ->first();

            if ($phanHoiDaCo) {
                abort(response()->json([
                    'success' => false,
                    'message' => 'Ban da phan hoi yeu cau nay roi.',
                ], 422));
            }

            PhanHoi::create([
                'gia_su_id' => $giaSu->id,
                'goi_hoc_id' => $goiHoc->id,
                'phan_hoi' => $duLieu['phan_hoi'],
                'ly_do' => $laTuChoi ? $lyDo : null,
            ]);

            if ($laTuChoi) {
                $goiHoc->update([
                    'trang_thai' => 'dahuy',
                ]);

                $goiHoc->lichHocs()->update([
                    'trang_thai' => 'dahuy',
                    'lydo_huy' => $lyDo,
                ]);
            }

            User::query()
                ->where('vai_tro', 'admin')
                ->get(['id'])
                ->each(fn (User $admin) => ThongBao::create([
                    'user_id' => $admin->id,
                    'tieu_de' => $laTuChoi ? 'Gia su tu choi yeu cau' : 'Gia su dong y yeu cau',
                    'noi_dung' => ($goiHoc->giasu?->user?->ho_ten ?? 'Gia su')
                        . ($laTuChoi ? ' da tu choi ' : ' da dong y ')
                        . 'yeu cau ' . 'GH' . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT)
                        . ($laTuChoi && $lyDo ? '. Ly do: ' . $lyDo : '.'),
                    'url' => '/admin/quan-ly-dat-goi',
                    'da_doc' => false,
                ]));

            ThongBao::create([
                'user_id' => $goiHoc->hocvien_id,
                'tieu_de' => $laTuChoi ? 'Gia su da tu choi yeu cau' : 'Gia su da dong y nhan lop',
                'noi_dung' => $laTuChoi
                    ? 'Gia su da tu choi yeu cau dat goi cua ban' . ($lyDo ? ': ' . $lyDo : '.')
                    : 'Gia su da dong y nhan lop. Vui long cho admin xu ly buoc tiep theo.',
                'url' => '/hoc-vien/lich-hoc',
                'da_doc' => false,
            ]);
        });

        $goiHocMoi = $goiHoc->fresh(['hocVien:id,ho_ten,email,sdt', 'monHoc:id,ten_mon,lop', 'lichHocs', 'phanHoiMoiNhat']);

        return response()->json([
            'success' => true,
            'message' => $laTuChoi ? 'Da tu choi yeu cau dat goi.' : 'Da dong y nhan lop.',
            'data' => $this->dinhDangYeuCauChoGiaSu($goiHocMoi),
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

        $goiHoc->update([
            'trang_thai' => 'cho_thanhtoan',
        ]);

        ThongBao::create([
            'user_id' => $goiHoc->hocvien_id,
            'tieu_de' => 'Yeu cau dat goi da duoc chap nhan',
            'noi_dung' => 'Gia su da dong y nhan lop. Ban co the tien hanh thanh toan goi hoc.',
            'url' => '/hoc-vien/lich-hoc',
            'da_doc' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Da chuyen goi hoc sang cho thanh toan.',
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
            'tieu_de' => 'Nhac thanh toan goi hoc',
            'noi_dung' => 'Goi hoc ' . 'GH' . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT) . ' dang cho thanh toan. Vui long hoan tat thanh toan de kich hoat lich hoc.',
            'url' => '/hoc-vien/lich-hoc',
            'da_doc' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Da gui thong bao nhac thanh toan cho hoc vien.',
            'data' => $this->dinhDangGoiHocChoAdmin($goiHoc),
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
                'tieu_de' => 'Thanh toan da duoc xac nhan',
                'noi_dung' => 'Thanh toan goi hoc ' . 'GH' . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT) . ' da duoc xac nhan. Lich hoc cua ban da duoc kich hoat.',
                'url' => '/hoc-vien/lich-hoc',
                'da_doc' => false,
            ]);

            if ($goiHoc->giasu?->user_id) {
                ThongBao::create([
                    'user_id' => $goiHoc->giasu->user_id,
                    'tieu_de' => 'Goi hoc da duoc thanh toan',
                    'noi_dung' => 'Goi hoc ' . 'GH' . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT) . ' da duoc xac nhan thanh toan. Ban co the theo doi trong lich day.',
                    'url' => '/gia-su/quan-ly/lich-day',
                    'da_doc' => false,
                ]);
            }
        });

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
                'tieu_de' => 'Thanh toan chua hop le',
                'noi_dung' => 'Thanh toan goi hoc ' . 'GH' . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT) . ' chua duoc chap nhan' . ($lyDo ? ': ' . $lyDo : '. Vui long kiem tra va gui lai minh chung.'),
                'url' => '/hoc-vien/lich-hoc',
                'da_doc' => false,
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Da tu choi thanh toan. Goi hoc van o trang thai cho thanh toan.',
            'data' => $this->dinhDangGoiHocChoAdmin($goiHoc->fresh(['hocVien', 'monHoc', 'giasu.user', 'lichHocs', 'phanHoiMoiNhat', 'thanhToanMoiNhat'])),
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
                'tieu_de' => 'Goi hoc da bi huy',
                'noi_dung' => 'Yeu cau dat goi cua ban da bi huy' . (filled($duLieu['ly_do'] ?? null) ? ': ' . trim($duLieu['ly_do']) : '.'),
                'url' => '/hoc-vien/lich-hoc',
                'da_doc' => false,
            ]);

            if ($goiHoc->giasu?->user_id) {
                ThongBao::create([
                    'user_id' => $goiHoc->giasu->user_id,
                    'tieu_de' => 'Yeu cau dat goi da bi huy',
                    'noi_dung' => 'Yeu cau dat goi ' . 'GH' . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT)
                        . ' da bi admin huy' . (filled($duLieu['ly_do'] ?? null) ? ': ' . trim($duLieu['ly_do']) : '.'),
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

        if ($goiHoc->thanhToanMoiNhat?->trang_thai === 'cho_thanhtoan') {
            return response()->json([
                'success' => false,
                'message' => 'Ban da gui minh chung thanh toan. Vui long cho admin xac nhan.',
            ], 422);
        }

        $duongDanMinhChung = $request->file('anh_minh_chung')->store('images/minh-chung-thanh-toan', 'public');
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
                    : 'Hoc vien gui minh chung thanh toan goi hoc.',
                'anh_minh_chung' => '/storage/' . $duongDanMinhChung,
                'ngay_thanhtoan' => now(),
                'trang_thai' => 'cho_thanhtoan',
            ]);

            User::query()
                ->where('vai_tro', 'admin')
                ->get(['id'])
                ->each(fn (User $admin) => ThongBao::create([
                    'user_id' => $admin->id,
                    'tieu_de' => 'Hoc vien gui minh chung thanh toan',
                    'noi_dung' => "{$user->ho_ten} da gui minh chung thanh toan goi hoc GH" . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT) . '. Vui long kiem tra va xac nhan.',
                    'url' => '/admin/quan-ly-dat-goi',
                    'da_doc' => false,
                ]));

            return $goiHoc->fresh(['monHoc:id,ten_mon,lop', 'giasu.user:id,ho_ten', 'lichHocs', 'thanhToanMoiNhat']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Da gui minh chung thanh toan. Vui long cho admin xac nhan.',
            'data' => $this->dinhDangGoiHocChoHocVien($goiHocMoi),
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
            'loai_goi_id' => ['required_if:loai_goi,dinh_ky', 'nullable', 'integer', 'exists:loai_goi,id'],
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
            'ghi_chu' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($duLieu['hinh_thuc_hoc'] === 'offline' && blank($duLieu['dia_chi_hoc'] ?? null)) {
            return response()->json([
                'success' => false,
                'message' => 'Vui long nhap dia chi hoc tai nha.',
            ], 422);
        }

        $loaiGoi = null;
        if ($duLieu['loai_goi'] === 'dinh_ky') {
            $loaiGoi = LoaiGoi::query()->find($duLieu['loai_goi_id']);
            $duLieu['so_thang'] = (int) $loaiGoi->so_thang;
            $duLieu['giam_gia'] = (float) $loaiGoi->phan_tram_giam;
        }

        if ($duLieu['loai_goi'] === 'hoc_thu') {
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

        $lichHocNhap = $this->taoLichHocTuYeuCau($duLieu);

        if (count($lichHocNhap) !== (int) $duLieu['so_buoi']) {
            return response()->json([
                'success' => false,
                'message' => 'So buoi hoc khong khop voi goi da chon.',
            ], 422);
        }

        $giamGia = (float) ($duLieu['giam_gia'] ?? 0);
        $donGia = (float) $mucGia->tong_gia;
        $tongTruocGiam = collect($lichHocNhap)->sum(fn (array $lichHoc) => $donGia * $lichHoc['so_gio']);
        $tongTien = round($tongTruocGiam * (100 - $giamGia) / 100);
        $heSoGiam = $tongTruocGiam > 0 ? $tongTien / $tongTruocGiam : 1;

        $goiHoc = DB::transaction(function () use ($duLieu, $user, $giaSu, $mucGia, $lichHocNhap, $donGia, $tongTien, $heSoGiam, $loaiGoi) {
            $ngayBatDau = collect($lichHocNhap)->min('ngay_hoc');
            $ngayKetThuc = collect($lichHocNhap)->max('ngay_hoc');

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
                    'ghi_chu' => filled($duLieu['ghi_chu'] ?? null) ? trim($duLieu['ghi_chu']) : null,
                ]);
            }

            User::query()
                ->where('vai_tro', 'admin')
                ->get(['id'])
                ->each(fn (User $admin) => ThongBao::create([
                    'user_id' => $admin->id,
                    'tieu_de' => 'Co yeu cau dat goi moi',
                    'noi_dung' => "{$user->ho_ten} vua gui yeu cau dat " . count($lichHocNhap) . ' buoi hoc. Vui long kiem tra va gui cho gia su.',
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

    private function taoLichHocTuYeuCau(array $duLieu): array
    {
        if ($duLieu['loai_goi'] === 'hoc_thu') {
            return [
                $this->taoMotBuoi($duLieu['ngay_batdau'], $duLieu['gio_batdau'], $duLieu['gio_ketthuc']),
            ];
        }

        if ($duLieu['loai_goi'] === 'khong_dinh_ky') {
            return collect($duLieu['buoi_linh_hoat'] ?? [])
                ->map(fn (array $buoi) => $this->taoMotBuoi($buoi['ngay'], $buoi['gio_batdau'], $buoi['gio_ketthuc']))
                ->sortBy(['ngay_hoc', 'gio_batdau'])
                ->values()
                ->all();
        }

        $thuHoc = collect($duLieu['thu_hoc'] ?? [])->unique()->sort()->values()->all();
        $lichHoc = [];
        $ngay = Carbon::parse($duLieu['ngay_batdau'])->startOfDay();

        while (count($lichHoc) < (int) $duLieu['so_buoi']) {
            if (in_array($ngay->isoWeekday(), $thuHoc, true)) {
                $lichHoc[] = $this->taoMotBuoi($ngay->toDateString(), $duLieu['gio_batdau'], $duLieu['gio_ketthuc']);
            }

            $ngay->addDay();
        }

        return $lichHoc;
    }

    private function layGiaSuDangNhap(Request $request): ?Giasu
    {
        $user = $request->user();

        if (! $user || $user->vai_tro !== 'giasu') {
            return null;
        }

        return Giasu::query()
            ->where('user_id', $user->id)
            ->first();
    }

    private function taoMotBuoi(string $ngayHoc, string $gioBatDau, string $gioKetThuc): array
    {
        $batDau = Carbon::createFromFormat('H:i', $gioBatDau);
        $ketThuc = Carbon::createFromFormat('H:i', $gioKetThuc);

        if ($ketThuc->lessThanOrEqualTo($batDau)) {
            abort(response()->json([
                'success' => false,
                'message' => 'Gio ket thuc phai sau gio bat dau.',
            ], 422));
        }

        $gioSomNhat = Carbon::createFromFormat('H:i', '07:00');
        $gioMuonNhat = Carbon::createFromFormat('H:i', '19:30');

        if ($batDau->lessThan($gioSomNhat) || $batDau->greaterThan($gioMuonNhat)) {
            abort(response()->json([
                'success' => false,
                'message' => 'Gio bat dau phai trong khoang 07:00 - 19:30.',
            ], 422));
        }

        $soPhut = (int) round($batDau->diffInMinutes($ketThuc));

        if ($soPhut !== 90) {
            abort(response()->json([
                'success' => false,
                'message' => 'Moi buoi hoc phai keo dai dung 1 gio 30 phut.',
            ], 422));
        }

        return [
            'ngay_hoc' => Carbon::parse($ngayHoc)->toDateString(),
            'gio_batdau' => $gioBatDau,
            'gio_ketthuc' => $gioKetThuc,
            'so_gio' => $soPhut / 60,
        ];
    }

    private function laGoiHocThu(GoiHoc $goiHoc): bool
    {
        return ! $goiHoc->hoc_dinhky && (int) $goiHoc->so_buoi === 1;
    }

    private function dinhDangGoiHoc(GoiHoc $goiHoc): array
    {
        return [
            'id' => $goiHoc->id,
            'ma' => 'GH' . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT),
            'trang_thai' => $goiHoc->trang_thai,
            'tong_tien' => (float) $goiHoc->tong_tien,
            'so_buoi' => $goiHoc->so_buoi,
            'ngay_batdau' => $goiHoc->ngay_batdau,
            'ngay_ketthuc' => $goiHoc->ngay_ketthuc,
            'lich_hoc' => $goiHoc->lichHocs
                ->sortBy(['ngay_hoc', 'gio_batdau'])
                ->map(fn (LichHoc $lichHoc) => [
                    'id' => $lichHoc->id,
                    'ma' => 'LH' . str_pad((string) $lichHoc->id, 6, '0', STR_PAD_LEFT),
                    'ngay_hoc' => $lichHoc->ngay_hoc,
                    'gio_batdau' => $lichHoc->gio_batdau,
                    'gio_ketthuc' => $lichHoc->gio_ketthuc,
                    'trang_thai' => $lichHoc->trang_thai,
                ])
                ->values(),
        ];
    }

    private function dinhDangGoiHocChoHocVien(GoiHoc $goiHoc): array
    {
        $trangThai = [
            'cho_xacnhan' => 'cho_xacnhan',
            'cho_thanhtoan' => 'cho_thanhtoan',
            'danghoc' => 'dang_hoc',
            'hoanthanh' => 'hoan_thanh',
            'dahuy' => 'da_huy',
        ][$goiHoc->trang_thai] ?? $goiHoc->trang_thai;

        return [
            'id' => $goiHoc->id,
            'ma' => 'GH' . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT),
            'mon' => $goiHoc->monHoc?->ten_mon ?? 'Mon hoc',
            'giaSu' => $goiHoc->giasu?->user?->ho_ten ?? 'Gia su',
            'ngayBatDau' => $goiHoc->ngay_batdau,
            'ngayKetThuc' => $goiHoc->ngay_ketthuc,
            'soBuoi' => $goiHoc->so_buoi,
            'soBuoiDaLenLich' => $goiHoc->lichHocs->count(),
            'hinhThuc' => $goiHoc->hinh_thuc_hoc === 'online' ? 'Online' : 'Tai nha',
            'diaDiem' => $goiHoc->dia_chi_hoc ?: ($goiHoc->hinh_thuc_hoc === 'online' ? 'Online' : 'Chua cap nhat'),
            'tongTien' => (float) $goiHoc->tong_tien,
            'trangThai' => $trangThai,
            'coTheHuy' => $goiHoc->trang_thai === 'cho_xacnhan',
            'coTheThanhToan' => $goiHoc->trang_thai === 'cho_thanhtoan'
                && ! in_array($goiHoc->thanhToanMoiNhat?->trang_thai, ['cho_thanhtoan', 'da_thanhtoan'], true),
            'thanhToan' => $goiHoc->thanhToanMoiNhat ? $this->dinhDangThanhToan($goiHoc->thanhToanMoiNhat) : null,
            'lichHoc' => $goiHoc->lichHocs
                ->map(fn (LichHoc $lichHoc) => $this->dinhDangLichHoc($lichHoc))
                ->values(),
        ];
    }

    private function dinhDangGoiHocChoAdmin(GoiHoc $goiHoc): array
    {
        $lichHocs = $goiHoc->lichHocs->sortBy(['ngay_hoc', 'gio_batdau'])->values();
        $lichDau = $lichHocs->first();
        $phanHoiMoiNhat = $goiHoc->phanHoiMoiNhat;
        $thanhToanMoiNhat = $goiHoc->thanhToanMoiNhat;
        $laHocThu = $this->laGoiHocThu($goiHoc);
        $trangThai = match ($goiHoc->trang_thai) {
            'cho_thanhtoan' => 'cho_thanh_toan',
            'danghoc' => 'da_tao_lich',
            'hoanthanh' => 'da_tao_lich',
            'dahuy' => 'da_huy',
            default => match ($phanHoiMoiNhat?->phan_hoi) {
                PhanHoi::DONG_Y => 'giasu_dong_y',
                PhanHoi::TU_CHOI => 'giasu_tu_choi',
                default => 'cho_xu_ly',
            },
        };

        return [
            'id' => $goiHoc->id,
            'ma' => 'GH' . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT),
            'trangThai' => $trangThai,
            'hocVien' => $goiHoc->hocVien?->ho_ten ?? 'Hoc vien',
            'hocVienEmail' => $goiHoc->hocVien?->email ?? 'Chua cap nhat',
            'hocVienSdt' => $goiHoc->hocVien?->sdt ?? 'Chua cap nhat',
            'giaSu' => $goiHoc->giasu?->user?->ho_ten ?? 'Gia su',
            'giaSuEmail' => $goiHoc->giasu?->user?->email ?? 'Chua cap nhat',
            'mon' => $goiHoc->monHoc?->ten_mon ?? 'Mon hoc',
            'capHoc' => $goiHoc->monHoc?->lop ?? 'Chua cap nhat',
            'loaiGoi' => $goiHoc->hoc_dinhky ? 'Dinh ky' : ($laHocThu ? 'Hoc thu' : 'Khong dinh ky'),
            'hocDinhKy' => (bool) $goiHoc->hoc_dinhky,
            'soBuoi' => $goiHoc->so_buoi,
            'gioMoiBuoi' => $lichDau ? round(Carbon::parse($lichDau->gio_batdau)->diffInMinutes(Carbon::parse($lichDau->gio_ketthuc)) / 60, 1) : 0,
            'tongTien' => number_format((float) $goiHoc->tong_tien, 0, ',', '.') . 'd',
            'lichMongMuon' => $this->dinhDangLichMongMuon($goiHoc, $lichHocs),
            'ngayMongMuon' => $this->dinhDangNgayMongMuon($goiHoc, $lichHocs),
            'gioMongMuon' => $this->dinhDangGioMongMuon($lichHocs),
            'hinhThuc' => $goiHoc->hinh_thuc_hoc === 'online' ? 'Online' : 'Tai nha',
            'diaDiem' => $goiHoc->dia_chi_hoc ?: ($goiHoc->hinh_thuc_hoc === 'online' ? 'Online' : 'Chua cap nhat'),
            'ngayTao' => $goiHoc->created_at?->format('d/m/Y H:i') ?? '',
            'daGuiGiaSuLuc' => null,
            'phanHoi' => $phanHoiMoiNhat ? $this->dinhDangPhanHoi($phanHoiMoiNhat) : null,
            'thanhToan' => $thanhToanMoiNhat ? $this->dinhDangThanhToan($thanhToanMoiNhat) : null,
            'lichHoc' => $lichHocs
                ->map(fn (LichHoc $lichHoc) => $this->dinhDangLichHoc($lichHoc))
                ->values(),
        ];
    }

    private function dinhDangYeuCauChoGiaSu(GoiHoc $goiHoc): array
    {
        $lichHocs = $goiHoc->lichHocs->sortBy(['ngay_hoc', 'gio_batdau'])->values();
        $lichDau = $lichHocs->first();
        $phanHoiMoiNhat = $goiHoc->phanHoiMoiNhat;
        $laHocThu = $this->laGoiHocThu($goiHoc);
        $trangThai = match ($phanHoiMoiNhat?->phan_hoi) {
            PhanHoi::DONG_Y => 'da_dong_y',
            PhanHoi::TU_CHOI => 'tu_choi',
            default => 'cho_phan_hoi',
        };

        return [
            'id' => $goiHoc->id,
            'maYeuCau' => 'GH' . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT),
            'guiLuc' => $goiHoc->created_at?->format('d/m/Y H:i') ?? '',
            'trangThai' => $trangThai,
            'hocVien' => $goiHoc->hocVien?->ho_ten ?? 'Hoc vien',
            'mon' => $goiHoc->monHoc?->ten_mon ?? 'Mon hoc',
            'capHoc' => $goiHoc->monHoc?->lop ?? 'Chua cap nhat',
            'lop' => $goiHoc->hoc_dinhky ? 'Hoc dinh ky' : ($laHocThu ? 'Hoc thu' : 'Hoc khong dinh ky'),
            'soBuoi' => $goiHoc->so_buoi,
            'gioMoiBuoi' => $lichDau ? round(Carbon::parse($lichDau->gio_batdau)->diffInMinutes(Carbon::parse($lichDau->gio_ketthuc)) / 60, 1) : 0,
            'lichMongMuon' => $this->dinhDangLichMongMuon($goiHoc, $lichHocs),
            'ngayBatDau' => $goiHoc->ngay_batdau ? Carbon::parse($goiHoc->ngay_batdau)->format('d/m/Y') : 'Chua cap nhat',
            'hocDinhKy' => (bool) $goiHoc->hoc_dinhky,
            'hinhThuc' => $goiHoc->hinh_thuc_hoc === 'online' ? 'Trực tuyến' : 'Trực tiếp',
            'diaDiem' => $goiHoc->dia_chi_hoc ?: ($goiHoc->hinh_thuc_hoc === 'online' ? 'Online' : 'Chua cap nhat'),
            'donGia' => number_format((float) $goiHoc->don_gia_theogio, 0, ',', '.') . 'd/gio',
            'tongTien' => number_format((float) $goiHoc->tong_tien, 0, ',', '.') . 'd',
            'ghiChu' => $lichDau?->ghi_chu ?: 'Khong co ghi chu.',
            'lyDoTuChoi' => $phanHoiMoiNhat?->phan_hoi === PhanHoi::TU_CHOI ? $phanHoiMoiNhat->ly_do : null,
            'lichHoc' => $lichHocs
                ->map(fn (LichHoc $lichHoc) => $this->dinhDangLichHoc($lichHoc))
                ->values(),
        ];
    }

    private function dinhDangLichDayChoGiaSu(LichHoc $lichHoc): array
    {
        $goiHoc = $lichHoc->goiHoc;
        $ngayHoc = Carbon::parse($lichHoc->ngay_hoc);
        $trangThai = [
            'cho_xacnhan' => 'cho_xac_nhan',
            'da_nhan' => 'sap_dien_ra',
            'hoanthanh' => 'hoan_thanh',
            'dahuy' => 'da_huy',
        ][$lichHoc->trang_thai] ?? 'sap_dien_ra';

        return [
            'id' => $lichHoc->id,
            'ma' => 'LH' . str_pad((string) $lichHoc->id, 6, '0', STR_PAD_LEFT),
            'batDau' => substr((string) $lichHoc->gio_batdau, 0, 5),
            'ketThuc' => substr((string) $lichHoc->gio_ketthuc, 0, 5),
            'thu' => $this->tenThu($ngayHoc->isoWeekday()),
            'ngayHoc' => $ngayHoc->format('d/m/Y'),
            'loaiBuoi' => $lichHoc->loai_buoi === 'hoc_bu' ? 'Hoc bu' : 'Hoc thuong',
            'mon' => $goiHoc?->monHoc?->ten_mon ?? 'Mon hoc',
            'capHoc' => $goiHoc?->monHoc?->lop ?? 'Chua cap nhat',
            'hocVien' => $goiHoc?->hocVien?->ho_ten ?? 'Hoc vien',
            'hinhThuc' => $lichHoc->hinh_thuc_hoc === 'online' ? 'Trực tuyến' : 'Trực tiếp',
            'diaDiem' => $lichHoc->dia_chi_hoc ?: ($lichHoc->hinh_thuc_hoc === 'online' ? 'Online' : 'Chua cap nhat'),
            'trangThai' => $trangThai,
            'ghiChu' => $lichHoc->ghi_chu ?: 'Khong co ghi chu.',
        ];
    }

    private function dinhDangPhanHoi(PhanHoi $phanHoi): array
    {
        return [
            'ketQua' => $phanHoi->phan_hoi,
            'lyDo' => $phanHoi->ly_do,
            'thoiGian' => $phanHoi->updated_at?->format('d/m/Y H:i') ?? '',
        ];
    }

    private function dinhDangThanhToan(ThanhToan $thanhToan): array
    {
        return [
            'id' => $thanhToan->id,
            'soTien' => number_format((float) $thanhToan->so_tien, 0, ',', '.') . 'd',
            'phuongThuc' => $this->dinhDangPhuongThucThanhToan($thanhToan->phuong_thuc),
            'soTaiKhoan' => $thanhToan->so_tai_khoan,
            'maGiaoDich' => $thanhToan->ma_giaodich,
            'noiDung' => $thanhToan->noi_dung_thanhtoan,
            'anhMinhChung' => $thanhToan->anh_minh_chung,
            'ngayThanhToan' => $thanhToan->ngay_thanhtoan?->format('d/m/Y H:i') ?? '',
            'trangThai' => $thanhToan->trang_thai,
        ];
    }

    private function dinhDangPhuongThucThanhToan(?string $phuongThuc): string
    {
        return [
            'tienmat' => 'Tiền mặt',
            'momo' => 'Momo',
            'zalopay' => 'ZaloPay',
            'banking' => 'Chuyển khoản',
        ][$phuongThuc] ?? 'Chưa cập nhật';
    }

    private function dinhDangLichMongMuon(GoiHoc $goiHoc, Collection $lichHocs): string
    {
        if ($lichHocs->isEmpty()) {
            return $this->dinhDangKhoangNgay($goiHoc->ngay_batdau, $goiHoc->ngay_ketthuc);
        }

        if ($goiHoc->hoc_dinhky) {
            $danhSachThu = $lichHocs
                ->map(fn (LichHoc $lichHoc) => $this->tenThu(Carbon::parse($lichHoc->ngay_hoc)->isoWeekday()))
                ->unique()
                ->values()
                ->join(', ');

            $danhSachGio = $lichHocs
                ->map(fn (LichHoc $lichHoc) => substr((string) $lichHoc->gio_batdau, 0, 5) . ' - ' . substr((string) $lichHoc->gio_ketthuc, 0, 5))
                ->unique()
                ->values();

            $khungGio = $danhSachGio->count() === 1
                ? $danhSachGio->first()
                : $danhSachGio->count() . ' khung gio';

            return trim($danhSachThu . ' · ' . $khungGio . ' · ' . $this->dinhDangKhoangNgay($goiHoc->ngay_batdau, $goiHoc->ngay_ketthuc));
        }

        $cacBuoiDau = $lichHocs
            ->take(3)
            ->map(fn (LichHoc $lichHoc) => Carbon::parse($lichHoc->ngay_hoc)->format('d/m') . ' '
                . substr((string) $lichHoc->gio_batdau, 0, 5)
                . ' - '
                . substr((string) $lichHoc->gio_ketthuc, 0, 5))
            ->join('; ');

        $soBuoiConLai = max($lichHocs->count() - 3, 0);

        return $cacBuoiDau . ($soBuoiConLai > 0 ? " (+{$soBuoiConLai} buoi)" : '');
    }

    private function dinhDangNgayMongMuon(GoiHoc $goiHoc, Collection $lichHocs): string
    {
        if ($lichHocs->isEmpty()) {
            return $this->dinhDangKhoangNgay($goiHoc->ngay_batdau, $goiHoc->ngay_ketthuc);
        }

        if ($goiHoc->hoc_dinhky) {
            $danhSachThu = $lichHocs
                ->map(fn (LichHoc $lichHoc) => $this->tenThu(Carbon::parse($lichHoc->ngay_hoc)->isoWeekday()))
                ->unique()
                ->values()
                ->join(', ');

            return $danhSachThu . ' · ' . $this->dinhDangKhoangNgay($goiHoc->ngay_batdau, $goiHoc->ngay_ketthuc);
        }

        return $lichHocs
            ->take(3)
            ->map(fn (LichHoc $lichHoc) => Carbon::parse($lichHoc->ngay_hoc)->format('d/m/Y'))
            ->join('; ')
            . ($lichHocs->count() > 3 ? ' +' . ($lichHocs->count() - 3) . ' buoi' : '');
    }

    private function dinhDangGioMongMuon(Collection $lichHocs): string
    {
        if ($lichHocs->isEmpty()) {
            return 'Chua cap nhat';
        }

        $danhSachGio = $lichHocs
            ->map(fn (LichHoc $lichHoc) => substr((string) $lichHoc->gio_batdau, 0, 5) . ' - ' . substr((string) $lichHoc->gio_ketthuc, 0, 5))
            ->unique()
            ->values();

        if ($danhSachGio->count() === 1) {
            return $danhSachGio->first();
        }

        return $danhSachGio->take(3)->join('; ')
            . ($danhSachGio->count() > 3 ? ' +' . ($danhSachGio->count() - 3) . ' khung gio' : '');
    }

    private function dinhDangKhoangNgay(?string $batDau, ?string $ketThuc): string
    {
        if (! $batDau || ! $ketThuc) {
            return 'Chua cap nhat';
        }

        return Carbon::parse($batDau)->format('d/m/Y') . ' - ' . Carbon::parse($ketThuc)->format('d/m/Y');
    }

    private function dinhDangLichHoc(LichHoc $lichHoc): array
    {
        $ngayHoc = Carbon::parse($lichHoc->ngay_hoc);
        $yeuCauHocBuMoiNhat = $lichHoc->relationLoaded('yeuCauHocBus')
            ? $lichHoc->yeuCauHocBus->sortByDesc('created_at')->first()
            : null;
        $trangThai = [
            'cho_xacnhan' => 'cho_xacnhan',
            'da_nhan' => 'da_nhan',
            'hoanthanh' => 'hoan_thanh',
            'dahuy' => 'da_huy',
        ][$lichHoc->trang_thai] ?? $lichHoc->trang_thai;

        return [
            'id' => $lichHoc->id,
            'ma' => 'LH' . str_pad((string) $lichHoc->id, 6, '0', STR_PAD_LEFT),
            'mon' => $lichHoc->goiHoc?->monHoc?->ten_mon ?? 'Mon hoc',
            'giaSu' => $lichHoc->giasu?->user?->ho_ten ?? 'Gia su',
            'ngayHoc' => $ngayHoc->toDateString(),
            'thu' => $this->tenThu($ngayHoc->isoWeekday()),
            'gioBatDau' => substr((string) $lichHoc->gio_batdau, 0, 5),
            'gioKetThuc' => substr((string) $lichHoc->gio_ketthuc, 0, 5),
            'hinhThuc' => $lichHoc->hinh_thuc_hoc === 'online' ? 'Online' : 'Tai nha',
            'diaDiem' => $lichHoc->dia_chi_hoc ?: ($lichHoc->hinh_thuc_hoc === 'online' ? 'Online' : 'Chua cap nhat'),
            'trangThai' => $trangThai,
            'loaiBuoi' => $lichHoc->loai_buoi === 'hoc_bu' ? 'Hoc bu' : 'Hoc thuong',
            'ghiChu' => $lichHoc->ghi_chu,
            'lyDoHuy' => $lichHoc->lydo_huy,
            'coTheDanhGia' => $lichHoc->trang_thai === 'hoanthanh',
            'coTheDoiBuoi' => in_array($lichHoc->trang_thai, ['cho_xacnhan', 'da_nhan'], true)
                && ! ($yeuCauHocBuMoiNhat?->trang_thai === 'cho_duyet'),
            'danhGia' => $lichHoc->danhGia ? $this->dinhDangDanhGia($lichHoc->danhGia) : null,
            'yeuCauDoiBuoi' => $yeuCauHocBuMoiNhat ? $this->dinhDangYeuCauHocBu($yeuCauHocBuMoiNhat) : null,
        ];
    }

    private function dinhDangDanhGia(DanhGia $danhGia): array
    {
        return [
            'id' => $danhGia->id,
            'soSao' => (int) $danhGia->so_sao,
            'noiDung' => $danhGia->noi_dung,
            'ngayDanhGia' => $danhGia->updated_at?->format('d/m/Y H:i') ?? '',
        ];
    }

    private function dinhDangYeuCauHocBu(YeuCauHocBu $yeuCau): array
    {
        return [
            'id' => $yeuCau->id,
            'ngayHoc' => $yeuCau->ngay_hoc ? Carbon::parse($yeuCau->ngay_hoc)->toDateString() : null,
            'gioBatDau' => substr((string) $yeuCau->gio_batdau, 0, 5),
            'gioKetThuc' => substr((string) $yeuCau->gio_ketthuc, 0, 5),
            'lyDo' => $yeuCau->ly_do,
            'trangThai' => $yeuCau->trang_thai,
            'ngayYeuCau' => $yeuCau->ngay_yeu_cau?->format('d/m/Y H:i') ?? '',
            'ngayXuLy' => $yeuCau->ngay_xu_ly?->format('d/m/Y H:i') ?? null,
        ];
    }

    private function tenThu(int $isoWeekday): string
    {
        return [
            1 => 'Thu 2',
            2 => 'Thu 3',
            3 => 'Thu 4',
            4 => 'Thu 5',
            5 => 'Thu 6',
            6 => 'Thu 7',
            7 => 'Chu nhat',
        ][$isoWeekday] ?? '';
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Giasu;
use App\Models\GiasuGia;
use App\Models\GoiHoc;
use App\Models\LichHoc;
use App\Models\LoaiGoi;
use App\Models\ThongBao;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
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
            'data' => $this->dinhDangGoiHocChoAdmin($goiHoc->fresh(['hocVien', 'monHoc', 'giasu.user', 'lichHocs'])),
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
        });

        return response()->json([
            'success' => true,
            'message' => 'Da huy yeu cau dat goi.',
            'data' => $this->dinhDangGoiHocChoAdmin($goiHoc->fresh(['hocVien', 'monHoc', 'giasu.user', 'lichHocs'])),
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
                'lichHocs' => fn ($query) => $query->orderBy('ngay_hoc')->orderBy('gio_batdau'),
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
            'loai_goi' => ['required', Rule::in(['dinh_ky', 'khong_dinh_ky'])],
            'loai_goi_id' => ['required_if:loai_goi,dinh_ky', 'nullable', 'integer', 'exists:loai_goi,id'],
            'goi_id' => ['nullable', 'string', 'max:80'],
            'ten_goi' => ['nullable', 'string', 'max:120'],
            'so_thang' => ['required', 'integer', 'min:1', 'max:12'],
            'so_buoi' => ['required', 'integer', 'min:1', 'max:120'],
            'giam_gia' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'ngay_batdau' => ['required', 'date'],
            'gio_batdau' => ['required_if:loai_goi,dinh_ky', 'nullable', 'date_format:H:i'],
            'gio_ketthuc' => ['required_if:loai_goi,dinh_ky', 'nullable', 'date_format:H:i'],
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
                'gio_batdau' => $duLieu['loai_goi'] === 'dinh_ky' ? $duLieu['gio_batdau'] : null,
                'gio_ketthuc' => $duLieu['loai_goi'] === 'dinh_ky' ? $duLieu['gio_ketthuc'] : null,
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

        return [
            'ngay_hoc' => Carbon::parse($ngayHoc)->toDateString(),
            'gio_batdau' => $gioBatDau,
            'gio_ketthuc' => $gioKetThuc,
            'so_gio' => $batDau->diffInMinutes($ketThuc) / 60,
        ];
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
            'lichHoc' => $goiHoc->lichHocs
                ->map(fn (LichHoc $lichHoc) => $this->dinhDangLichHoc($lichHoc))
                ->values(),
        ];
    }

    private function dinhDangGoiHocChoAdmin(GoiHoc $goiHoc): array
    {
        $lichDau = $goiHoc->lichHocs->sortBy(['ngay_hoc', 'gio_batdau'])->first();
        $trangThai = match ($goiHoc->trang_thai) {
            'dahuy' => 'da_huy',
            'cho_thanhtoan' => 'cho_thanh_toan',
            'danghoc' => 'da_tao_lich',
            'hoanthanh' => 'da_tao_lich',
            default => 'cho_xu_ly',
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
            'loaiGoi' => $goiHoc->hoc_dinhky ? 'Dinh ky' : 'Khong dinh ky',
            'soBuoi' => $goiHoc->so_buoi,
            'gioMoiBuoi' => $lichDau ? round(Carbon::parse($lichDau->gio_batdau)->diffInMinutes(Carbon::parse($lichDau->gio_ketthuc)) / 60, 1) : 0,
            'tongTien' => number_format((float) $goiHoc->tong_tien, 0, ',', '.') . 'd',
            'lichMongMuon' => $this->dinhDangKhoangNgay($goiHoc->ngay_batdau, $goiHoc->ngay_ketthuc),
            'hinhThuc' => $goiHoc->hinh_thuc_hoc === 'online' ? 'Online' : 'Tai nha',
            'diaDiem' => $goiHoc->dia_chi_hoc ?: ($goiHoc->hinh_thuc_hoc === 'online' ? 'Online' : 'Chua cap nhat'),
            'ngayTao' => $goiHoc->created_at?->format('d/m/Y H:i') ?? '',
            'daGuiGiaSuLuc' => null,
            'phanHoi' => null,
        ];
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

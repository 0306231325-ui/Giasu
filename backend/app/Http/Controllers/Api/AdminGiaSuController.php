<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DanhGia;
use App\Models\Giasu;
use App\Models\GiasuBangCap;
use App\Models\GiasuGia;
use App\Models\ThongBao;
use App\Models\TrinhDoGiasu;
use App\Services\GiaTinhService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AdminGiaSuController extends Controller
{
    private const SO_GIA_SU_MOI_TRANG = 10;

    public function danhSachHoSoChoDuyet(Request $request): JsonResponse
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền truy cập.',
            ], 403);
        }

        $tuKhoa = trim((string) $request->query('q', ''));

        $danhSach = Giasu::query()
            ->where('trang_thai_ho_so', 'cho_duyet')
            ->when($tuKhoa !== '', function ($query) use ($tuKhoa) {
                $query->whereHas('user', function ($userQuery) use ($tuKhoa) {
                    $userQuery->where(function ($subQuery) use ($tuKhoa) {
                        $subQuery
                            ->where('ho_ten', 'like', "%{$tuKhoa}%")
                            ->orWhere('email', 'like', "%{$tuKhoa}%")
                            ->orWhere('sdt', 'like', "%{$tuKhoa}%");
                    });
                });
            })
            ->with([
                'user:id,ho_ten,email,sdt,ngay_sinh,trang_thai,vai_tro,anh_dai_dien',
                'trinhDo:id,ten,thu_tu',
                'mucKinhNghiem:id,tu_khoang,den_khoang',
                'bangCaps' => fn ($query) => $query
                    ->with('trinhDo:id,ten,thu_tu')
                    ->latest(),
                'giasuGias' => fn ($query) => $query
                    ->with('monHoc.capHoc:id,ten')
                    ->latest(),
            ])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Giasu $giaSu) => $this->dinhDangHoSoChoDuyet($giaSu))
            ->values();

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách hồ sơ chờ duyệt thành công.',
            'data' => [
                'hoSo' => $danhSach,
                'thongKe' => [
                    'choDuyet' => $danhSach->count(),
                    'daDuyet' => Giasu::query()->where('trang_thai_ho_so', 'duyet')->count(),
                    'tuChoi' => Giasu::query()->where('trang_thai_ho_so', 'tu_choi')->count(),
                ],
            ],
        ]);
    }

    public function xuLyHoSoDangKy(Request $request, int $giaSuId): JsonResponse
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền truy cập.',
            ], 403);
        }

        $duLieu = $request->validate([
            'hanh_dong' => ['required', 'in:duyet,tu_choi'],
            'he_so_gia' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'ly_do' => ['required_if:hanh_dong,tu_choi', 'nullable', 'string', 'min:5', 'max:1000'],
        ], [
            'hanh_dong.required' => 'Vui lòng chọn thao tác xử lý hồ sơ.',
            'hanh_dong.in' => 'Thao tác xử lý hồ sơ không hợp lệ.',
            'he_so_gia.numeric' => 'Hệ số giá phải là số.',
            'he_so_gia.min' => 'Hệ số giá không được nhỏ hơn 0%.',
            'he_so_gia.max' => 'Hệ số giá không được lớn hơn 100%.',
            'ly_do.required_if' => 'Vui lòng nhập lý do từ chối.',
            'ly_do.min' => 'Lý do từ chối phải có ít nhất 5 ký tự.',
        ]);

        $giaSu = Giasu::query()
            ->where('trang_thai_ho_so', 'cho_duyet')
            ->with(['user', 'bangCaps.trinhDo', 'giasuGias.monHoc'])
            ->find($giaSuId);

        if (! $giaSu || ! $giaSu->user) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy hồ sơ chờ duyệt.',
            ], 404);
        }

        DB::transaction(function () use ($request, $duLieu, $giaSu) {
            if ($duLieu['hanh_dong'] === 'duyet') {
                $trinhDoCaoNhatId = $this->layTrinhDoCaoNhatTuBangCap($giaSu);

                $giaSu->update([
                    'trinh_do_giasu_id' => $trinhDoCaoNhatId ?: $giaSu->trinh_do_giasu_id,
                    'he_so_gia' => (float) ($duLieu['he_so_gia'] ?? 0),
                    'trang_thai_ho_so' => 'duyet',
                    'duyet_boi' => $request->user()->id,
                    'duyet_luc' => now(),
                    'ly_do_tu_choi' => null,
                ]);

                $giaSu->user->update([
                    'vai_tro' => 'giasu',
                    'trang_thai' => 'hoatdong',
                ]);

                $giaSu->bangCaps()
                    ->where('trang_thai', 'cho_duyet')
                    ->update([
                        'trang_thai' => 'duyet',
                        'duyet_boi' => $request->user()->id,
                        'duyet_luc' => now(),
                        'ly_do' => null,
                    ]);

                foreach ($giaSu->giasuGias()->get() as $mucGia) {
                    $giaMoi = GiaTinhService::tinhGiaGiasu($mucGia->monhoc_id, $giaSu->id) ?? [];
                    $mucGia->update(array_merge($giaMoi, [
                        'trang_thai' => GiasuGia::TRANG_THAI_DA_DUYET,
                        'ly_do_tu_choi' => null,
                    ]));
                }

                ThongBao::create([
                    'user_id' => $giaSu->user_id,
                    'tieu_de' => 'Hồ sơ gia sư đã được duyệt',
                    'noi_dung' => 'Chúc mừng! Hồ sơ gia sư của bạn đã được quản trị viên duyệt. Nhấn vào đây để chuyển tới trang quản lý gia sư.',
                    'url' => '/gia-su/quan-ly/ho-so',
                    'da_doc' => false,
                ]);

                return;
            }

            $lyDo = trim((string) $duLieu['ly_do']);

            $giaSu->update([
                'trang_thai_ho_so' => 'tu_choi',
                'duyet_boi' => $request->user()->id,
                'duyet_luc' => now(),
                'ly_do_tu_choi' => $lyDo,
            ]);

            $giaSu->bangCaps()
                ->where('trang_thai', 'cho_duyet')
                ->update([
                    'trang_thai' => 'tu_choi',
                    'duyet_boi' => $request->user()->id,
                    'duyet_luc' => now(),
                    'ly_do' => $lyDo,
                ]);

            $giaSu->giasuGias()
                ->where('trang_thai', GiasuGia::TRANG_THAI_CHO_DUYET)
                ->update([
                    'trang_thai' => GiasuGia::TRANG_THAI_TU_CHOI,
                    'ly_do_tu_choi' => $lyDo,
                ]);

            ThongBao::create([
                'user_id' => $giaSu->user_id,
                'tieu_de' => 'Hồ sơ gia sư chưa được duyệt',
                'noi_dung' => "Hồ sơ gia sư của bạn chưa được duyệt. Lý do: {$lyDo}",
                'url' => '/dang-ky-lam-gia-su',
                'da_doc' => false,
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => $duLieu['hanh_dong'] === 'duyet'
                ? 'Đã duyệt hồ sơ gia sư.'
                : 'Đã từ chối hồ sơ gia sư.',
        ]);
    }

    public function xemBangCapAdmin(Request $request, int $bangCapId)
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền truy cập.',
            ], 403);
        }

        $bangCap = GiasuBangCap::query()->find($bangCapId);

        if (! $bangCap) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy tài liệu.',
            ], 404);
        }

        if (! Storage::disk('local')->exists($bangCap->file_url)) {
            return response()->json([
                'success' => false,
                'message' => 'File tài liệu không còn tồn tại.',
            ], 404);
        }

        return response()->file(
            Storage::disk('local')->path($bangCap->file_url),
            ['Content-Disposition' => 'inline'],
        );
    }

    public function danhSachGiaSu(Request $request)
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền truy cập.',
            ], 403);
        }

        $tuKhoa = trim((string) $request->query('q', ''));
        $trangThai = $request->query('trang_thai');
        $trinhDoId = $request->integer('trinh_do_id');

        $danhSach = Giasu::query()
            ->where('trang_thai_ho_so', 'duyet')
            ->when($tuKhoa !== '', function ($query) use ($tuKhoa) {
                $query->whereHas('user', function ($userQuery) use ($tuKhoa) {
                    $userQuery->where(function ($subQuery) use ($tuKhoa) {
                        $subQuery
                            ->where('ho_ten', 'like', "%{$tuKhoa}%")
                            ->orWhere('email', 'like', "%{$tuKhoa}%")
                            ->orWhere('sdt', 'like', "%{$tuKhoa}%");
                    });
                });
            })
            ->when(in_array($trangThai, ['hoatdong', 'khoa'], true), function ($query) use ($trangThai) {
                $query->whereHas('user', fn ($userQuery) => $userQuery->where('trang_thai', $trangThai));
            })
            ->when($trinhDoId > 0, fn ($query) => $query->where('trinh_do_giasu_id', $trinhDoId))
            ->with([
                'user:id,ho_ten,email,sdt,trang_thai',
                'trinhDo:id,ten',
                'mucKinhNghiem:id,tu_khoang,den_khoang',
                'giasuGias' => function ($query) {
                    $query
                        ->where('trang_thai', GiasuGia::TRANG_THAI_DA_DUYET)
                        ->with('monHoc:id,ten_mon');
                },
            ])
            ->addSelect([
                'diem_danh_gia' => DanhGia::query()
                    ->selectRaw('AVG(danhgia.so_sao)')
                    ->join('lichhoc', 'lichhoc.id', '=', 'danhgia.lichhoc_id')
                    ->whereColumn('lichhoc.giasu_id', 'giasu.id'),
                'so_danh_gia' => DanhGia::query()
                    ->selectRaw('COUNT(*)')
                    ->join('lichhoc', 'lichhoc.id', '=', 'danhgia.lichhoc_id')
                    ->whereColumn('lichhoc.giasu_id', 'giasu.id'),
            ])
            ->orderByDesc('duyet_luc')
            ->orderByDesc('id')
            ->paginate(self::SO_GIA_SU_MOI_TRANG)
            ->withQueryString();

        $danhSach->setCollection(
            $danhSach->getCollection()
                ->map(fn (Giasu $giaSu) => $this->dinhDangGiaSu($giaSu))
                ->values(),
        );

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách gia sư thành công.',
            'data' => [
                'giaSu' => $danhSach,
                'trinhDo' => TrinhDoGiasu::query()
                    ->orderBy('thu_tu')
                    ->orderBy('id')
                    ->get(['id', 'ten']),
            ],
        ]);
    }

    public function capNhatTrangThaiGiaSu(Request $request, int $giaSuId)
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền truy cập.',
            ], 403);
        }

        $duLieu = $request->validate([
            'trang_thai' => ['required', 'in:hoatdong,khoa'],
        ]);

        $giaSu = Giasu::query()
            ->where('trang_thai_ho_so', 'duyet')
            ->with([
                'user:id,ho_ten,email,sdt,trang_thai',
                'trinhDo:id,ten',
                'mucKinhNghiem:id,tu_khoang,den_khoang',
                'giasuGias' => function ($query) {
                    $query
                        ->where('trang_thai', GiasuGia::TRANG_THAI_DA_DUYET)
                        ->with('monHoc:id,ten_mon');
                },
            ])
            ->find($giaSuId);

        if (! $giaSu || ! $giaSu->user) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy tài khoản gia sư.',
            ], 404);
        }

        $giaSu->user->trang_thai = $duLieu['trang_thai'];
        $giaSu->user->save();

        if ($giaSu->user->trang_thai === 'khoa') {
            $giaSu->user->tokens()->delete();
        }

        $giaSu->setRelation('user', $giaSu->user->fresh());

        return response()->json([
            'success' => true,
            'message' => $giaSu->user->trang_thai === 'khoa'
                ? 'Đã khóa tài khoản gia sư.'
                : 'Đã mở khóa tài khoản gia sư.',
            'data' => [
                'id' => $giaSu->id,
                'trangThai' => $giaSu->user->trang_thai,
            ],
        ]);
    }

    private function dinhDangGiaSu(Giasu $giaSu): array
    {
        $mucKinhNghiem = $giaSu->mucKinhNghiem;
        $monDay = $giaSu->giasuGias
            ->pluck('monHoc.ten_mon')
            ->filter()
            ->unique()
            ->values();

        return [
            'id' => $giaSu->id,
            'hoTen' => $giaSu->user?->ho_ten ?? 'Chưa cập nhật',
            'email' => $giaSu->user?->email ?? 'Chưa cập nhật',
            'sdt' => $giaSu->user?->sdt ?? 'Chưa cập nhật',
            'trinhDoId' => $giaSu->trinh_do_giasu_id,
            'trinhDo' => $giaSu->trinhDo?->ten ?? 'Chưa cập nhật',
            'kinhNghiem' => $this->dinhDangKinhNghiem(
                $mucKinhNghiem?->tu_khoang,
                $mucKinhNghiem?->den_khoang,
            ),
            'monDay' => $monDay,
            'soMon' => $monDay->count(),
            'danhGia' => round((float) ($giaSu->diem_danh_gia ?? 0), 1),
            'soDanhGia' => (int) ($giaSu->so_danh_gia ?? 0),
            'ngayDuyet' => $giaSu->duyet_luc
                ? date('d/m/Y', strtotime($giaSu->duyet_luc))
                : 'Chưa cập nhật',
            'trangThai' => $giaSu->user?->trang_thai ?? 'khoa',
        ];
    }

    private function dinhDangHoSoChoDuyet(Giasu $giaSu): array
    {
        $user = $giaSu->user;
        $bangCap = $giaSu->bangCaps
            ->map(fn (GiasuBangCap $taiLieu) => [
                'id' => $taiLieu->id,
                'ten' => $taiLieu->ten_bang,
                'loai' => $this->dinhDangLoaiBang($taiLieu->loai_bang),
                'trinhDo' => $taiLieu->trinhDo?->ten ?? 'Chưa chọn trình độ',
                'chuyenNganh' => $taiLieu->chuyen_nganh ?: 'Chưa cập nhật',
                'donVi' => $taiLieu->truong_don_vi ?: 'Chưa cập nhật',
                'trangThai' => $taiLieu->trang_thai,
                'urlXem' => "/admin/gia-su/bang-cap/{$taiLieu->id}/xem",
            ])
            ->values();

        $monDay = $giaSu->giasuGias
            ->filter(fn (GiasuGia $mucGia) => $mucGia->monHoc)
            ->map(fn (GiasuGia $mucGia) => [
                'id' => $mucGia->id,
                'ten' => $mucGia->monHoc->ten_mon,
                'cap' => $mucGia->monHoc->capHoc?->ten ?? 'Chưa cập nhật',
                'giaMon' => number_format((float) $mucGia->gia_mon, 0, ',', '.') . 'đ',
                'giaCongTrinhDo' => number_format((float) $mucGia->gia_cong_trinh_do, 0, ',', '.') . 'đ',
                'giaCongKinhNghiem' => number_format((float) $mucGia->gia_cong_kinh_nghiem, 0, ',', '.') . 'đ',
                'giaCongThem' => number_format((float) $mucGia->gia_cong_them, 0, ',', '.') . 'đ',
                'tongGia' => number_format((float) $mucGia->tong_gia, 0, ',', '.') . 'đ',
                'trangThai' => $mucGia->trang_thai,
            ])
            ->values();

        return [
            'id' => $giaSu->id,
            'hoTen' => $user?->ho_ten ?? 'Chưa cập nhật',
            'email' => $user?->email ?? 'Chưa cập nhật',
            'sdt' => $user?->sdt ?? 'Chưa cập nhật',
            'avatar' => $giaSu->avatar ?: $user?->anh_dai_dien,
            'avatarUrl' => $this->taoUrlCongKhai($giaSu->avatar ?: $user?->anh_dai_dien),
            'ngaySinh' => $user?->ngay_sinh
                ? $user->ngay_sinh->format('d/m/Y')
                : 'Chưa cập nhật',
            'diaChi' => $giaSu->dia_chi ?: 'Chưa cập nhật',
            'ngayGui' => $giaSu->created_at
                ? $giaSu->created_at->format('d/m/Y · H:i')
                : 'Chưa cập nhật',
            'trinhDo' => $giaSu->trinhDo?->ten ?? $this->layTenTrinhDoCaoNhatTuBangCap($giaSu),
            'kinhNghiem' => $this->dinhDangKinhNghiem(
                $giaSu->mucKinhNghiem?->tu_khoang,
                $giaSu->mucKinhNghiem?->den_khoang,
            ),
            'heSoGia' => (float) ($giaSu->he_so_gia ?? 0),
            'gioiThieu' => $giaSu->mo_ta ?: 'Chưa cập nhật giới thiệu.',
            'bangCap' => $bangCap,
            'monDay' => $monDay,
        ];
    }

    private function taoUrlCongKhai(?string $duongDan): ?string
    {
        if (! $duongDan) {
            return null;
        }

        if (str_starts_with($duongDan, 'http://') || str_starts_with($duongDan, 'https://')) {
            return $duongDan;
        }

        return url(ltrim($duongDan, '/'));
    }

    private function layTrinhDoCaoNhatTuBangCap(Giasu $giaSu): ?int
    {
        return $giaSu->bangCaps()
            ->join('trinh_do_giasu', 'trinh_do_giasu.id', '=', 'giasu_bang_cap.trinh_do_giasu_id')
            ->orderByDesc('trinh_do_giasu.thu_tu')
            ->orderByDesc('trinh_do_giasu.id')
            ->value('giasu_bang_cap.trinh_do_giasu_id');
    }

    private function layTenTrinhDoCaoNhatTuBangCap(Giasu $giaSu): string
    {
        $bangCap = $giaSu->bangCaps
            ->filter(fn (GiasuBangCap $taiLieu) => $taiLieu->trinhDo)
            ->sortByDesc(fn (GiasuBangCap $taiLieu) => $taiLieu->trinhDo->thu_tu ?? 0)
            ->first();

        return $bangCap?->trinhDo?->ten ?? 'Chưa cập nhật';
    }

    private function dinhDangLoaiBang(?string $loaiBang): string
    {
        return match ($loaiBang) {
            'bang_cap' => 'Bằng cấp',
            'chung_chi' => 'Chứng chỉ',
            'khac' => 'Khác',
            default => 'Chưa phân loại',
        };
    }

    private function dinhDangKinhNghiem(?int $tuKhoang, ?int $denKhoang): string
    {
        if ($tuKhoang === null) {
            return 'Chưa cập nhật';
        }

        if ($denKhoang === null) {
            return "Từ {$tuKhoang} năm kinh nghiệm";
        }

        if ($tuKhoang === $denKhoang) {
            return "{$tuKhoang} năm kinh nghiệm";
        }

        return "{$tuKhoang} - {$denKhoang} năm kinh nghiệm";
    }
}

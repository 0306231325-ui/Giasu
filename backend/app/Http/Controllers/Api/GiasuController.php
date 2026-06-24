<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DanhGia;
use App\Models\CapHoc;
use App\Models\Giasu;
use App\Models\GiasuBangCap;
use App\Models\GiasuGia;
use App\Models\MonHoc;
use App\Models\MucKinhNghiem;
use App\Models\TrinhDoGiasu;
use App\Services\GiaTinhService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class GiasuController extends Controller
{
    public function index()
    {
        try {

            $danhSachGiaSu = Giasu::with([
                                        'user:id,ho_ten,anh_dai_dien,sdt',
                                    ])
                                    ->withCount([
                                        'lichHocs as danh_gias_count' => function ($query) {
                                            $query->whereHas('danhGia');
                                        },
                                    ])
                                    ->withMin('giasuGias as gia_tu', 'tong_gia')
                                    ->withMax('giasuGias as gia_den', 'tong_gia')
                                    ->addSelect([
                                        'danh_gias_avg_so_sao' => DanhGia::selectRaw('coalesce(avg(danhgia.so_sao), 0)')
                                            ->join('lichhoc', 'lichhoc.id', '=', 'danhgia.lichhoc_id')
                                            ->join('goihoc', 'goihoc.id', '=', 'lichhoc.goihoc_id')
                                            ->whereColumn('goihoc.giasu_id', 'giasu.id')
                                            ->limit(1),
                                    ])
                                    ->orderBy('id', 'desc')
                                    ->paginate(12);

            return response()->json([
                'success' => true,
                'message' => 'Lấy danh sách gia sư thành công',
                'data' => $danhSachGiaSu
            ], 200);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage()
            ], 500);

        }
    }

    public function hoSoCaNhan(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->vai_tro !== 'giasu') {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ tài khoản gia sư mới có thể truy cập hồ sơ này.',
            ], 403);
        }

        $giaSu = $user->giasu()->first();

        if (! $giaSu) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy hồ sơ gia sư.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->dinhDangThongTinCaNhan($user, $giaSu),
        ]);
    }

    public function capNhatHoSoCaNhan(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->vai_tro !== 'giasu') {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ tài khoản gia sư mới có thể cập nhật hồ sơ này.',
            ], 403);
        }

        $giaSu = $user->giasu()->first();

        if (! $giaSu) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy hồ sơ gia sư.',
            ], 404);
        }

        $duLieu = $request->validate([
            'ho_ten' => ['required', 'string', 'min:2', 'max:100'],
            'ngay_sinh' => ['required', 'date', 'before:today'],
            'sdt' => ['required', 'regex:/^(0|\+84)[0-9]{9}$/'],
            'email' => [
                'required',
                'email',
                'max:100',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'dia_chi' => ['required', 'string', 'min:5', 'max:255'],
            'mo_ta' => ['nullable', 'string', 'max:2000'],
        ], [
            'ho_ten.required' => 'Vui lòng nhập họ và tên.',
            'ho_ten.min' => 'Họ và tên phải có ít nhất 2 ký tự.',
            'ngay_sinh.required' => 'Vui lòng chọn ngày sinh.',
            'ngay_sinh.before' => 'Ngày sinh phải trước ngày hiện tại.',
            'sdt.required' => 'Vui lòng nhập số điện thoại.',
            'sdt.regex' => 'Số điện thoại không đúng định dạng Việt Nam.',
            'email.required' => 'Vui lòng nhập email.',
            'email.email' => 'Email không đúng định dạng.',
            'email.unique' => 'Email này đã được sử dụng.',
            'dia_chi.required' => 'Vui lòng nhập địa chỉ hiện tại.',
            'dia_chi.min' => 'Địa chỉ phải có ít nhất 5 ký tự.',
            'mo_ta.max' => 'Giới thiệu bản thân không được vượt quá 2000 ký tự.',
        ]);

        DB::transaction(function () use ($duLieu, $user, $giaSu) {
            $user->update([
                'ho_ten' => trim($duLieu['ho_ten']),
                'ngay_sinh' => $duLieu['ngay_sinh'],
                'sdt' => $duLieu['sdt'],
                'email' => strtolower(trim($duLieu['email'])),
            ]);

            $giaSu->update([
                'dia_chi' => trim($duLieu['dia_chi']),
                'mo_ta' => filled($duLieu['mo_ta'] ?? null)
                    ? trim($duLieu['mo_ta'])
                    : null,
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin cá nhân thành công.',
            'data' => $this->dinhDangThongTinCaNhan($user->fresh(), $giaSu->fresh()),
        ]);
    }

    public function capNhatAvatar(Request $request): JsonResponse
    {
        $giaSu = $this->layHoSoGiaSu($request);

        if (! $giaSu) {
            return $this->phanHoiKhongCoHoSo($request);
        }

        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ], [
            'avatar.required' => 'Vui lòng chọn ảnh đại diện.',
            'avatar.image' => 'File tải lên phải là hình ảnh.',
            'avatar.mimes' => 'Ảnh đại diện chỉ hỗ trợ JPG, JPEG, PNG hoặc WEBP.',
            'avatar.max' => 'Ảnh đại diện không được vượt quá 5MB.',
        ]);

        $thuMucAnh = public_path('images/avatar-gia-su');

        if (! File::isDirectory($thuMucAnh)) {
            File::makeDirectory($thuMucAnh, 0755, true);
        }

        $file = $request->file('avatar');
        $tenFile = 'gia-su-' . $giaSu->id . '-' . time() . '-' . bin2hex(random_bytes(4))
            . '.' . $file->getClientOriginalExtension();
        $duongDanMoi = 'images/avatar-gia-su/' . $tenFile;
        $duongDanCu = $giaSu->avatar;

        $file->move($thuMucAnh, $tenFile);

        try {
            DB::transaction(function () use ($giaSu, $duongDanMoi) {
                $giaSu->update(['avatar' => $duongDanMoi]);
                $giaSu->user()->update([
                    'anh_dai_dien' => url($duongDanMoi),
                ]);
            });
        } catch (\Throwable $loi) {
            File::delete(public_path($duongDanMoi));
            throw $loi;
        }

        $this->xoaAvatarGiaSuCu($duongDanCu);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật ảnh đại diện thành công.',
            'data' => [
                'avatar' => $duongDanMoi,
                'avatar_url' => url($duongDanMoi),
            ],
        ]);
    }

    public function chuyenMon(Request $request): JsonResponse
    {
        $giaSu = $this->layHoSoGiaSu($request);

        if (! $giaSu) {
            return $this->phanHoiKhongCoHoSo($request);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'thong_tin' => $this->dinhDangChuyenMon($giaSu),
                'trinh_do' => TrinhDoGiasu::query()
                    ->select('id', 'ten', 'thu_tu')
                    ->orderBy('thu_tu')
                    ->get(),
                'muc_kinh_nghiem' => MucKinhNghiem::query()
                    ->select('id', 'tu_khoang', 'den_khoang')
                    ->orderBy('tu_khoang')
                    ->get(),
            ],
        ]);
    }

    public function capNhatChuyenMon(Request $request): JsonResponse
    {
        $giaSu = $this->layHoSoGiaSu($request);

        if (! $giaSu) {
            return $this->phanHoiKhongCoHoSo($request);
        }

        $duLieu = $request->validate([
            'trinh_do_giasu_id' => [
                'required',
                'integer',
                'exists:trinh_do_giasu,id',
            ],
            'muc_kinh_nghiem_id' => [
                'required',
                'integer',
                'exists:muc_kinh_nghiem,id',
            ],
        ], [
            'trinh_do_giasu_id.required' => 'Vui lòng chọn trình độ.',
            'trinh_do_giasu_id.exists' => 'Trình độ không hợp lệ.',
            'muc_kinh_nghiem_id.required' => 'Vui lòng chọn mức kinh nghiệm.',
            'muc_kinh_nghiem_id.exists' => 'Mức kinh nghiệm không hợp lệ.',
        ]);

        DB::transaction(function () use ($duLieu, $giaSu) {
            $giaSu->update([
                'trinh_do_giasu_id' => $duLieu['trinh_do_giasu_id'],
                'muc_kinh_nghiem_id' => $duLieu['muc_kinh_nghiem_id'],
            ]);

            foreach ($giaSu->giasuGias()->get() as $mucGia) {
                $giaMoi = GiaTinhService::tinhGiaGiasu(
                    $mucGia->monhoc_id,
                    $giaSu->id,
                );

                if ($giaMoi) {
                    $mucGia->update($giaMoi);
                }
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trình độ và kinh nghiệm thành công.',
            'data' => $this->dinhDangChuyenMon($giaSu->fresh()),
        ]);
    }

    public function danhSachMonDay(Request $request): JsonResponse
    {
        $giaSu = $this->layHoSoGiaSu($request);

        if (! $giaSu) {
            return $this->phanHoiKhongCoHoSo($request);
        }

        $monDaDangKy = $giaSu->giasuGias()
            ->with('monHoc.capHoc:id,ten')
            ->where('trang_thai', '!=', GiasuGia::TRANG_THAI_NGUNG_DAY)
            ->latest()
            ->get()
            ->filter(fn (GiasuGia $mucGia) => $mucGia->monHoc)
            ->groupBy(fn (GiasuGia $mucGia) => implode('|', [
                $mucGia->monHoc->cap_hoc_id,
                $mucGia->monHoc->ten_mon,
            ]))
            ->map(function ($cacMucGia) {
                $mucGia = $cacMucGia->sortBy(fn (GiasuGia $muc) => match ($muc->trang_thai) {
                    GiasuGia::TRANG_THAI_CHO_DUYET => 1,
                    GiasuGia::TRANG_THAI_TU_CHOI => 2,
                    default => 3,
                })->first();

                return [
                    'id' => $mucGia->id,
                    'tenMon' => $mucGia->monHoc->ten_mon,
                    'capHocId' => $mucGia->monHoc->cap_hoc_id,
                    'capHoc' => $mucGia->monHoc->capHoc?->ten,
                    'gia' => (float) $mucGia->tong_gia,
                    'trangThai' => $mucGia->trang_thai,
                    'lyDo' => $mucGia->ly_do_tu_choi,
                ];
            })
            ->values();

        $monDaCoTheoCapVaTen = $giaSu->giasuGias()
            ->join('monhoc', 'monhoc.id', '=', 'giasu_gia.monhoc_id')
            ->get(['monhoc.cap_hoc_id', 'monhoc.ten_mon'])
            ->mapWithKeys(fn ($monHoc) => [
                "{$monHoc->cap_hoc_id}|{$monHoc->ten_mon}" => true,
            ]);

        $monCoTheThem = MonHoc::query()
            ->with('capHoc:id,ten')
            ->orderBy('cap_hoc_id')
            ->orderBy('ten_mon')
            ->get(['id', 'ten_mon', 'cap_hoc_id', 'lop'])
            ->unique(fn (MonHoc $monHoc) => "{$monHoc->cap_hoc_id}|{$monHoc->ten_mon}")
            ->reject(fn (MonHoc $monHoc) => $monDaCoTheoCapVaTen->has(
                "{$monHoc->cap_hoc_id}|{$monHoc->ten_mon}",
            ))
            ->map(fn (MonHoc $monHoc) => [
                'id' => $monHoc->id,
                'ten_mon' => $monHoc->ten_mon,
                'cap_hoc_id' => $monHoc->cap_hoc_id,
                'cap_hoc' => $monHoc->capHoc?->ten,
            ])
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'mon_da_dang_ky' => $monDaDangKy,
                'mon_co_the_them' => $monCoTheThem,
                'cap_hoc' => CapHoc::query()
                    ->orderBy('thu_tu')
                    ->orderBy('id')
                    ->get(['id', 'ten']),
            ],
        ]);
    }

    public function themMonDay(Request $request): JsonResponse
    {
        $giaSu = $this->layHoSoGiaSu($request);

        if (! $giaSu) {
            return $this->phanHoiKhongCoHoSo($request);
        }

        $duLieu = $request->validate([
            'mon_hoc_ids' => ['required', 'array', 'min:1'],
            'mon_hoc_ids.*' => ['integer', 'distinct', 'exists:monhoc,id'],
        ], [
            'mon_hoc_ids.required' => 'Vui lòng chọn ít nhất một môn học.',
            'mon_hoc_ids.min' => 'Vui lòng chọn ít nhất một môn học.',
        ]);

        $monHopLe = MonHoc::query()
            ->whereIn('id', $duLieu['mon_hoc_ids'])
            ->get(['id', 'cap_hoc_id']);

        if ($monHopLe->count() !== count($duLieu['mon_hoc_ids'])) {
            return response()->json([
                'success' => false,
                'message' => 'Có môn học không hợp lệ.',
            ], 422);
        }

        if ($giaSu->giasuGias()->whereIn('monhoc_id', $monHopLe->pluck('id'))->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Có môn học đã tồn tại trong hồ sơ.',
            ], 422);
        }

        DB::transaction(function () use ($giaSu, $monHopLe) {
            $giaSu->capHocs()->syncWithoutDetaching(
                $monHopLe->pluck('cap_hoc_id')->unique()->all(),
            );

            foreach ($monHopLe as $monHoc) {
                $gia = GiaTinhService::tinhGiaGiasu($monHoc->id, $giaSu->id);
                if ($gia) {
                    $giaSu->giasuGias()->create(array_merge($gia, [
                        'trang_thai' => GiasuGia::TRANG_THAI_CHO_DUYET,
                    ]));
                }
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Đã thêm môn dạy và gửi xét duyệt.',
        ], 201);
    }

    public function xoaMonDay(Request $request, int $mucGiaId): JsonResponse
    {
        $giaSu = $this->layHoSoGiaSu($request);

        if (! $giaSu) {
            return $this->phanHoiKhongCoHoSo($request);
        }

        $mucGia = $giaSu->giasuGias()->find($mucGiaId);
        if (! $mucGia) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy môn dạy.',
            ], 404);
        }

        $mucGia->loadMissing('monHoc:id,ten_mon,cap_hoc_id');

        if (! $mucGia->monHoc) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy thông tin môn học.',
            ], 404);
        }

        $cacMucCungMon = $giaSu->giasuGias()
            ->whereHas('monHoc', function ($query) use ($mucGia) {
                $query
                    ->where('cap_hoc_id', $mucGia->monHoc->cap_hoc_id)
                    ->where('ten_mon', $mucGia->monHoc->ten_mon);
            })
            ->get();

        $coMonDaDuyet = $cacMucCungMon->contains(
            fn (GiasuGia $muc) => $muc->trang_thai === GiasuGia::TRANG_THAI_DA_DUYET,
        );

        DB::transaction(function () use ($cacMucCungMon) {
            foreach ($cacMucCungMon as $muc) {
                if ($muc->trang_thai === GiasuGia::TRANG_THAI_DA_DUYET) {
                    $muc->update([
                        'trang_thai' => GiasuGia::TRANG_THAI_NGUNG_DAY,
                    ]);
                } else {
                    $muc->delete();
                }
            }
        });

        $message = $coMonDaDuyet
            ? 'Đã ngừng dạy môn học.'
            : 'Đã xóa môn học khỏi hồ sơ.';

        return response()->json(['success' => true, 'message' => $message]);
    }

    public function danhSachBangCap(Request $request): JsonResponse
    {
        $giaSu = $this->layHoSoGiaSu($request);

        if (! $giaSu) {
            return $this->phanHoiKhongCoHoSo($request);
        }

        return response()->json([
            'success' => true,
            'data' => $giaSu->bangCaps()
                ->with('trinhDo:id,ten,thu_tu')
                ->latest()
                ->get()
                ->map(fn (GiasuBangCap $bangCap) => $this->dinhDangBangCap($bangCap)),
        ]);
    }

    public function themBangCap(Request $request): JsonResponse
    {
        $giaSu = $this->layHoSoGiaSu($request);

        if (! $giaSu) {
            return $this->phanHoiKhongCoHoSo($request);
        }

        $duLieu = $request->validate([
            'ten_bang' => ['required', 'string', 'min:2', 'max:255'],
            'loai_bang' => ['required', Rule::in(['bang_cap', 'chung_chi', 'khac'])],
            'trinh_do_giasu_id' => ['required', 'integer', 'exists:trinh_do_giasu,id'],
            'chuyen_nganh' => ['nullable', 'string', 'max:255'],
            'truong_don_vi' => ['required', 'string', 'min:2', 'max:255'],
            'tai_lieu' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ], [
            'ten_bang.required' => 'Vui lòng nhập tên bằng cấp hoặc chứng chỉ.',
            'ten_bang.min' => 'Tên tài liệu phải có ít nhất 2 ký tự.',
            'loai_bang.required' => 'Vui lòng chọn loại tài liệu.',
            'loai_bang.in' => 'Loại tài liệu không hợp lệ.',
            'trinh_do_giasu_id.required' => 'Vui lòng chọn trình độ xác minh.',
            'trinh_do_giasu_id.exists' => 'Trình độ xác minh không hợp lệ.',
            'truong_don_vi.required' => 'Vui lòng nhập trường hoặc đơn vị cấp.',
            'truong_don_vi.min' => 'Tên trường hoặc đơn vị phải có ít nhất 2 ký tự.',
            'tai_lieu.required' => 'Vui lòng chọn file minh chứng.',
            'tai_lieu.file' => 'File minh chứng không hợp lệ.',
            'tai_lieu.mimes' => 'File minh chứng chỉ hỗ trợ PDF, JPG, JPEG hoặc PNG.',
            'tai_lieu.max' => 'File minh chứng không được lớn hơn 5MB.',
            'tai_lieu.uploaded' => 'Tải file thất bại. Vui lòng chọn file nhỏ hơn 5MB.',
        ]);

        $duongDan = $request->file('tai_lieu')->store(
            "giasu/{$giaSu->id}/bang-cap",
            'local',
        );

        if (! $duongDan) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể lưu file minh chứng. Vui lòng thử lại.',
            ], 500);
        }

        try {
            $bangCap = $giaSu->bangCaps()->create([
                'ten_bang' => trim($duLieu['ten_bang']),
                'loai_bang' => $duLieu['loai_bang'],
                'trinh_do_giasu_id' => $duLieu['trinh_do_giasu_id'],
                'chuyen_nganh' => filled($duLieu['chuyen_nganh'] ?? null)
                    ? trim($duLieu['chuyen_nganh'])
                    : null,
                'truong_don_vi' => trim($duLieu['truong_don_vi']),
                'file_url' => $duongDan,
                'trang_thai' => 'cho_duyet',
                'duyet_boi' => null,
                'duyet_luc' => null,
                'ly_do' => null,
            ]);
        } catch (\Throwable $exception) {
            Storage::disk('local')->delete($duongDan);
            throw $exception;
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã thêm tài liệu và gửi xét duyệt.',
            'data' => $this->dinhDangBangCap($bangCap),
        ], 201);
    }

    public function xemBangCap(Request $request, int $bangCapId)
    {
        $giaSu = $this->layHoSoGiaSu($request);

        if (! $giaSu) {
            return $this->phanHoiKhongCoHoSo($request);
        }

        $bangCap = $giaSu->bangCaps()->find($bangCapId);

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

    public function xoaBangCap(Request $request, int $bangCapId): JsonResponse
    {
        $giaSu = $this->layHoSoGiaSu($request);

        if (! $giaSu) {
            return $this->phanHoiKhongCoHoSo($request);
        }

        $bangCap = $giaSu->bangCaps()->find($bangCapId);

        if (! $bangCap) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy tài liệu.',
            ], 404);
        }

        $duongDan = $bangCap->file_url;
        $bangCap->delete();
        Storage::disk('local')->delete($duongDan);

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa bằng cấp hoặc chứng chỉ.',
        ]);
    }

    private function layHoSoGiaSu(Request $request): ?Giasu
    {
        if ($request->user()?->vai_tro !== 'giasu') {
            return null;
        }

        return $request->user()->giasu()->first();
    }

    private function phanHoiKhongCoHoSo(Request $request): JsonResponse
    {
        $laGiaSu = $request->user()?->vai_tro === 'giasu';

        return response()->json([
            'success' => false,
            'message' => $laGiaSu
                ? 'Không tìm thấy hồ sơ gia sư.'
                : 'Chỉ tài khoản gia sư mới có thể quản lý tài liệu.',
        ], $laGiaSu ? 404 : 403);
    }

    private function dinhDangBangCap(GiasuBangCap $bangCap): array
    {
        $bangCap->loadMissing('trinhDo:id,ten,thu_tu');

        return [
            'id' => $bangCap->id,
            'ten_bang' => $bangCap->ten_bang,
            'loai_bang' => $bangCap->loai_bang,
            'trinh_do_giasu_id' => $bangCap->trinh_do_giasu_id,
            'ten_trinh_do' => $bangCap->trinhDo?->ten,
            'thu_tu_trinh_do' => $bangCap->trinhDo?->thu_tu,
            'chuyen_nganh' => $bangCap->chuyen_nganh,
            'truong_don_vi' => $bangCap->truong_don_vi,
            'trang_thai' => $bangCap->trang_thai,
            'ly_do' => $bangCap->ly_do,
            'duyet_luc' => $bangCap->duyet_luc?->toISOString(),
            'created_at' => $bangCap->created_at?->toISOString(),
            'url_xem' => "/gia-su/ho-so/bang-cap/{$bangCap->id}/xem",
        ];
    }

    private function dinhDangChuyenMon(Giasu $giaSu): array
    {
        $giaSu->loadMissing(['trinhDo:id,ten', 'mucKinhNghiem:id,tu_khoang,den_khoang']);

        return [
            'trinh_do_giasu_id' => $giaSu->trinh_do_giasu_id,
            'ten_trinh_do' => $giaSu->trinhDo?->ten,
            'muc_kinh_nghiem_id' => $giaSu->muc_kinh_nghiem_id,
            'muc_kinh_nghiem' => $giaSu->mucKinhNghiem
                ? [
                    'tu_khoang' => $giaSu->mucKinhNghiem->tu_khoang,
                    'den_khoang' => $giaSu->mucKinhNghiem->den_khoang,
                ]
                : null,
        ];
    }

    private function dinhDangThongTinCaNhan($user, Giasu $giaSu): array
    {
        $thongKeDanhGia = DanhGia::query()
            ->join('lichhoc', 'lichhoc.id', '=', 'danhgia.lichhoc_id')
            ->where('lichhoc.giasu_id', $giaSu->id)
            ->selectRaw('COUNT(danhgia.id) as so_luong')
            ->selectRaw('COALESCE(AVG(danhgia.so_sao), 0) as trung_binh')
            ->first();

        return [
            'ho_ten' => $user->ho_ten,
            'ngay_sinh' => $user->ngay_sinh?->format('Y-m-d'),
            'sdt' => $user->sdt,
            'email' => $user->email,
            'dia_chi' => $giaSu->dia_chi,
            'mo_ta' => $giaSu->mo_ta,
            'avatar' => $giaSu->avatar,
            'avatar_url' => $giaSu->avatar ? url($giaSu->avatar) : null,
            'diem_danh_gia' => round((float) $thongKeDanhGia->trung_binh, 1),
            'so_luong_danh_gia' => (int) $thongKeDanhGia->so_luong,
        ];
    }

    private function xoaAvatarGiaSuCu(?string $avatar): void
    {
        if (! $avatar) {
            return;
        }

        $duongDan = ltrim(parse_url($avatar, PHP_URL_PATH) ?: $avatar, '/');

        if (! str_starts_with($duongDan, 'images/avatar-gia-su/')) {
            return;
        }

        $file = public_path($duongDan);

        if (File::exists($file)) {
            File::delete($file);
        }
    }
}

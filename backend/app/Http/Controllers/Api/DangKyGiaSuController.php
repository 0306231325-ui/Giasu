<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
use Illuminate\Validation\Rule;

class DangKyGiaSuController extends Controller
{
    public function danhMuc(): JsonResponse
    {
        $monHocIds = MonHoc::query()
            ->selectRaw('MIN(id)')
            ->groupBy('cap_hoc_id', 'ten_mon');

        return response()->json([
            'success' => true,
            'data' => [
                'trinh_do' => TrinhDoGiasu::query()
                    ->select('id', 'ten', 'thu_tu')
                    ->orderBy('thu_tu')
                    ->get(),
                'cap_hoc' => CapHoc::query()
                    ->select('id', 'ten')
                    ->orderBy('thu_tu')
                    ->get(),
                'mon_hoc' => MonHoc::query()
                    ->select('id', 'ten_mon', 'cap_hoc_id')
                    ->whereIn('id', $monHocIds)
                    ->orderBy('ten_mon')
                    ->get(),
                'muc_kinh_nghiem' => MucKinhNghiem::query()
                    ->select('id', 'tu_khoang', 'den_khoang')
                    ->orderBy('tu_khoang')
                    ->get(),
            ],
        ]);
    }

    public function tinhGia(Request $request): JsonResponse
    {
        $duLieu = $request->validate([
            'mon_hoc_ids' => ['required', 'array', 'min:1'],
            'mon_hoc_ids.*' => ['integer', 'distinct', 'exists:monhoc,id'],
            'trinh_do_giasu_id' => ['required', 'integer', 'exists:trinh_do_giasu,id'],
            'muc_kinh_nghiem_id' => ['required', 'integer', 'exists:muc_kinh_nghiem,id'],
        ]);

        return response()->json([
            'success' => true,
            'data' => GiaTinhService::tinhGiaDuKien(
                $duLieu['mon_hoc_ids'],
                $duLieu['trinh_do_giasu_id'],
                $duLieu['muc_kinh_nghiem_id'],
            ),
        ]);
    }

    public function guiDon(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng đăng nhập trước khi gửi đơn đăng ký.',
            ], 401);
        }

        $duLieu = $request->validate([
            'ho_ten' => ['required', 'string', 'min:2', 'max:100'],
            'ngay_sinh' => ['required', 'date', 'before:today'],
            'so_dien_thoai' => ['required', 'regex:/^(0|\+84)[0-9]{9}$/'],
            'email' => [
                'required',
                'email',
                'max:100',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'dia_chi' => ['required', 'string', 'min:5', 'max:255'],
            'anh_chan_dung' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'muc_kinh_nghiem_id' => ['required', 'integer', 'exists:muc_kinh_nghiem,id'],
            'gioi_thieu' => ['required', 'string', 'min:10', 'max:2000'],
            'mon_hoc_ids' => ['required', 'array', 'min:1'],
            'mon_hoc_ids.*' => ['integer', 'distinct', 'exists:monhoc,id'],
            'bang_cap' => ['required', 'array', 'min:1'],
            'bang_cap.*.ten_bang' => ['required', 'string', 'min:2', 'max:255'],
            'bang_cap.*.loai_bang' => ['required', Rule::in(['bang_cap', 'chung_chi', 'khac'])],
            'bang_cap.*.trinh_do_giasu_id' => ['required', 'integer', 'exists:trinh_do_giasu,id'],
            'bang_cap.*.chuyen_nganh' => ['nullable', 'string', 'max:255'],
            'bang_cap.*.truong_don_vi' => ['required', 'string', 'min:2', 'max:255'],
            'bang_cap.*.tai_lieu' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'dong_y' => ['accepted'],
        ], [
            'ho_ten.required' => 'Vui lòng nhập họ và tên.',
            'ngay_sinh.required' => 'Vui lòng chọn ngày sinh.',
            'ngay_sinh.before' => 'Ngày sinh không hợp lệ.',
            'so_dien_thoai.required' => 'Vui lòng nhập số điện thoại.',
            'so_dien_thoai.regex' => 'Số điện thoại không hợp lệ.',
            'email.required' => 'Vui lòng nhập email.',
            'email.email' => 'Email không hợp lệ.',
            'email.unique' => 'Email này đã được sử dụng.',
            'dia_chi.required' => 'Vui lòng nhập địa chỉ hiện tại.',
            'anh_chan_dung.required' => 'Vui lòng chọn ảnh chân dung.',
            'anh_chan_dung.image' => 'Ảnh chân dung không hợp lệ.',
            'anh_chan_dung.mimes' => 'Ảnh chân dung chỉ hỗ trợ JPG, JPEG, PNG hoặc WEBP.',
            'anh_chan_dung.max' => 'Ảnh chân dung không được lớn hơn 5MB.',
            'anh_chan_dung.uploaded' => 'Tải ảnh chân dung thất bại. Vui lòng chọn ảnh nhỏ hơn 2MB hoặc thử ảnh khác.',
            'gioi_thieu.required' => 'Vui lòng nhập giới thiệu bản thân.',
            'gioi_thieu.min' => 'Giới thiệu bản thân phải có ít nhất 10 ký tự.',
            'muc_kinh_nghiem_id.required' => 'Vui lòng chọn mức kinh nghiệm.',
            'mon_hoc_ids.required' => 'Vui lòng chọn ít nhất một môn học.',
            'mon_hoc_ids.min' => 'Vui lòng chọn ít nhất một môn học.',
            'bang_cap.required' => 'Vui lòng thêm ít nhất một bằng cấp hoặc chứng chỉ.',
            'bang_cap.min' => 'Vui lòng thêm ít nhất một bằng cấp hoặc chứng chỉ.',
            'bang_cap.*.trinh_do_giasu_id.required' => 'Vui lòng chọn trình độ xác minh cho từng tài liệu.',
            'bang_cap.*.tai_lieu.required' => 'Vui lòng chọn file minh chứng cho từng tài liệu.',
            'bang_cap.*.tai_lieu.file' => 'File minh chứng không hợp lệ. Vui lòng chọn lại file.',
            'bang_cap.*.tai_lieu.mimes' => 'File minh chứng chỉ hỗ trợ PDF, JPG, JPEG hoặc PNG.',
            'bang_cap.*.tai_lieu.max' => 'File minh chứng không được lớn hơn 5MB.',
            'bang_cap.*.tai_lieu.uploaded' => 'Tải file minh chứng thất bại. Vui lòng chọn file nhỏ hơn 2MB hoặc thử file khác.',
            'dong_y.accepted' => 'Vui lòng xác nhận cam kết thông tin.',
        ]);

        if ($user->giasu?->trang_thai_ho_so === 'duyet') {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản này đã được duyệt làm gia sư.',
            ], 422);
        }

        $trinhDoCaoNhatId = $this->layTrinhDoCaoNhatId(
            collect($duLieu['bang_cap'])->pluck('trinh_do_giasu_id')->all(),
        );

        if (! $trinhDoCaoNhatId) {
            return response()->json([
                'success' => false,
                'message' => 'Không xác định được trình độ cao nhất từ hồ sơ chuyên môn.',
            ], 422);
        }

        $avatarMoi = null;
        if ($request->hasFile('anh_chan_dung')) {
            $avatarMoi = $this->luuAnhChanDung($request);
        }

        $fileDaLuu = [];
        $anhCuCanXoa = [];

        try {
            $giaSu = DB::transaction(function () use ($request, $user, $duLieu, $trinhDoCaoNhatId, $avatarMoi, &$fileDaLuu, &$anhCuCanXoa) {
                $giaSu = $user->giasu()->firstOrCreate([]);

                $this->xoaTaiLieuDangKyCu($giaSu);

                if ($avatarMoi) {
                    $anhCuCanXoa = array_filter([
                        $user->anh_dai_dien,
                        $giaSu->avatar,
                    ]);
                }

                $user->update([
                    'ho_ten' => trim($duLieu['ho_ten']),
                    'ngay_sinh' => $duLieu['ngay_sinh'],
                    'email' => trim($duLieu['email']),
                    'sdt' => trim($duLieu['so_dien_thoai']),
                    'anh_dai_dien' => $avatarMoi ?: $user->anh_dai_dien,
                ]);

                $giaSu->update([
                    'mo_ta' => trim($duLieu['gioi_thieu']),
                    'muc_kinh_nghiem_id' => $duLieu['muc_kinh_nghiem_id'],
                    'he_so_gia' => $giaSu->he_so_gia ?? 0,
                    'trinh_do_giasu_id' => $trinhDoCaoNhatId,
                    'dia_chi' => trim($duLieu['dia_chi']),
                    'avatar' => $avatarMoi ?: $giaSu->avatar,
                    'trang_thai_ho_so' => 'cho_duyet',
                    'duyet_boi' => null,
                    'duyet_luc' => null,
                ]);

                foreach ($duLieu['bang_cap'] as $index => $taiLieu) {
                    $duongDan = $this->luuFileBangCap($giaSu, $request->file("bang_cap.{$index}.tai_lieu"));

                    $fileDaLuu[] = $duongDan;

                    $giaSu->bangCaps()->create([
                        'ten_bang' => trim($taiLieu['ten_bang']),
                        'loai_bang' => $taiLieu['loai_bang'],
                        'trinh_do_giasu_id' => $taiLieu['trinh_do_giasu_id'],
                        'chuyen_nganh' => filled($taiLieu['chuyen_nganh'] ?? null)
                            ? trim($taiLieu['chuyen_nganh'])
                            : null,
                        'truong_don_vi' => trim($taiLieu['truong_don_vi']),
                        'file_url' => $duongDan,
                        'trang_thai' => 'cho_duyet',
                        'duyet_boi' => null,
                        'duyet_luc' => null,
                        'ly_do' => null,
                    ]);
                }

                $monHoc = $this->layTatCaMonTheoCapVaTen($duLieu['mon_hoc_ids']);

                $giaSu->capHocs()->sync($monHoc->pluck('cap_hoc_id')->unique()->all());

                foreach ($monHoc as $mon) {
                    $gia = GiaTinhService::tinhGiaGiasu($mon->id, $giaSu->id);
                    if ($gia) {
                        $giaSu->giasuGias()->create(array_merge($gia, [
                            'trang_thai' => GiasuGia::TRANG_THAI_CHO_DUYET,
                            'ly_do_tu_choi' => null,
                        ]));
                    }
                }

                return $giaSu;
            });
        } catch (\Throwable $exception) {
            if ($avatarMoi) {
                File::delete(public_path($avatarMoi));
            }

            foreach ($fileDaLuu as $duongDan) {
                $this->xoaFileBangCap($duongDan);
            }

            throw $exception;
        }

        if ($avatarMoi) {
            $this->xoaAnhChanDungCu($anhCuCanXoa, $avatarMoi);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã gửi đơn đăng ký gia sư. Vui lòng chờ quản trị viên xét duyệt.',
            'data' => [
                'giasu_id' => $giaSu->id,
                'trang_thai_ho_so' => 'cho_duyet',
                'user' => [
                    'id' => $user->id,
                    'ho_ten' => $user->ho_ten,
                    'ngay_sinh' => $user->ngay_sinh?->format('Y-m-d'),
                    'email' => $user->email,
                    'sdt' => $user->sdt,
                    'dia_chi' => $giaSu->dia_chi,
                    'vai_tro' => $user->vai_tro,
                    'trang_thai' => $user->trang_thai,
                    'anh_dai_dien' => $user->anh_dai_dien,
                ],
            ],
        ], 201);
    }

    private function layTrinhDoCaoNhatId(array $trinhDoIds): ?int
    {
        return TrinhDoGiasu::query()
            ->whereIn('id', $trinhDoIds)
            ->orderByDesc('thu_tu')
            ->orderByDesc('id')
            ->value('id');
    }

    private function layTatCaMonTheoCapVaTen(array $monHocIds)
    {
        $monDaiDien = MonHoc::query()
            ->whereIn('id', $monHocIds)
            ->get(['id', 'cap_hoc_id', 'ten_mon']);

        $nhomMon = $monDaiDien
            ->unique(fn (MonHoc $monHoc) => "{$monHoc->cap_hoc_id}|{$monHoc->ten_mon}")
            ->values();

        if ($nhomMon->isEmpty()) {
            return collect();
        }

        return MonHoc::query()
            ->where(function ($query) use ($nhomMon) {
                foreach ($nhomMon as $monHoc) {
                    $query->orWhere(function ($subQuery) use ($monHoc) {
                        $subQuery
                            ->where('cap_hoc_id', $monHoc->cap_hoc_id)
                            ->where('ten_mon', $monHoc->ten_mon);
                    });
                }
            })
            ->orderBy('cap_hoc_id')
            ->orderBy('ten_mon')
            ->orderBy('lop')
            ->get(['id', 'cap_hoc_id', 'ten_mon', 'lop']);
    }

    private function luuAnhChanDung(Request $request): string
    {
        $thuMucAnh = public_path('images/avatar-gia-su');

        if (! File::exists($thuMucAnh)) {
            File::makeDirectory($thuMucAnh, 0755, true);
        }

        $file = $request->file('anh_chan_dung');
        $tenFile = 'dang-ky-gia-su-' . $request->user()->id . '-' . time() . '-' . bin2hex(random_bytes(4))
            . '.' . $file->getClientOriginalExtension();

        $file->move($thuMucAnh, $tenFile);

        return 'images/avatar-gia-su/' . $tenFile;
    }

    private function luuFileBangCap(Giasu $giaSu, $file): string
    {
        $thuMuc = public_path("images/bang-cap-gia-su/{$giaSu->id}");

        if (! File::exists($thuMuc)) {
            File::makeDirectory($thuMuc, 0755, true);
        }

        $tenFile = 'bang-cap-' . $giaSu->id . '-' . time() . '-' . bin2hex(random_bytes(4))
            . '.' . $file->getClientOriginalExtension();

        $file->move($thuMuc, $tenFile);

        return "images/bang-cap-gia-su/{$giaSu->id}/{$tenFile}";
    }

    private function xoaTaiLieuDangKyCu(Giasu $giaSu): void
    {
        foreach ($giaSu->bangCaps as $bangCap) {
            $this->xoaFileBangCap($bangCap->file_url);
        }

        $giaSu->bangCaps()->delete();
        $giaSu->giasuGias()->delete();
        $giaSu->capHocs()->detach();
    }

    private function xoaAnhChanDungCu(array $danhSachDuongDan, string $avatarMoi): void
    {
        collect($danhSachDuongDan)
            ->filter()
            ->unique()
            ->reject(fn (string $duongDan) => $duongDan === $avatarMoi)
            ->filter(fn (string $duongDan) => str_starts_with($duongDan, 'images/avatar-gia-su/'))
            ->each(fn (string $duongDan) => File::delete(public_path($duongDan)));
    }

    private function xoaFileBangCap(?string $duongDan): void
    {
        if (! $duongDan) {
            return;
        }

        $duongDanTuongDoi = ltrim(parse_url($duongDan, PHP_URL_PATH) ?: $duongDan, '/');

        File::delete(public_path($duongDanTuongDoi));
    }
}

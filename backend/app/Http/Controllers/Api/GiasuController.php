<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DanhGia;
use App\Models\Giasu;
use App\Models\GiasuBangCap;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

    public function danhSachBangCap(Request $request): JsonResponse
    {
        $giaSu = $this->layHoSoGiaSu($request);

        if (! $giaSu) {
            return $this->phanHoiKhongCoHoSo($request);
        }

        return response()->json([
            'success' => true,
            'data' => $giaSu->bangCaps()
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
            'chuyen_nganh' => ['nullable', 'string', 'max:255'],
            'truong_don_vi' => ['required', 'string', 'min:2', 'max:255'],
            'tai_lieu' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ], [
            'ten_bang.required' => 'Vui lòng nhập tên bằng cấp hoặc chứng chỉ.',
            'ten_bang.min' => 'Tên tài liệu phải có ít nhất 2 ký tự.',
            'loai_bang.required' => 'Vui lòng chọn loại tài liệu.',
            'loai_bang.in' => 'Loại tài liệu không hợp lệ.',
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
        return [
            'id' => $bangCap->id,
            'ten_bang' => $bangCap->ten_bang,
            'loai_bang' => $bangCap->loai_bang,
            'chuyen_nganh' => $bangCap->chuyen_nganh,
            'truong_don_vi' => $bangCap->truong_don_vi,
            'trang_thai' => $bangCap->trang_thai,
            'ly_do' => $bangCap->ly_do,
            'duyet_luc' => $bangCap->duyet_luc?->toISOString(),
            'created_at' => $bangCap->created_at?->toISOString(),
            'url_xem' => "/gia-su/ho-so/bang-cap/{$bangCap->id}/xem",
        ];
    }

    private function dinhDangThongTinCaNhan($user, Giasu $giaSu): array
    {
        return [
            'ho_ten' => $user->ho_ten,
            'ngay_sinh' => $user->ngay_sinh?->format('Y-m-d'),
            'sdt' => $user->sdt,
            'email' => $user->email,
            'dia_chi' => $giaSu->dia_chi,
            'mo_ta' => $giaSu->mo_ta,
        ];
    }
}

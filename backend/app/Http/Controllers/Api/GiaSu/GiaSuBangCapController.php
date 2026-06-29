<?php

namespace App\Http\Controllers\Api\GiaSu;

use App\Http\Controllers\Controller;
use App\Models\GiasuBangCap;
use App\Services\GiaSuFileService;
use App\Services\GiaSuHoSoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GiaSuBangCapController extends Controller
{
    public function __construct(
        private readonly GiaSuHoSoService $giaSuHoSoService,
        private readonly GiaSuFileService $giaSuFileService,
    ) {
    }

    public function danhSachBangCap(Request $request): JsonResponse
    {
        $giaSu = $this->giaSuHoSoService->layHoSoGiaSu($request->user());

        if (! $giaSu) {
            return $this->phanHoiKhongCoHoSo($request);
        }

        return response()->json([
            'success' => true,
            'data' => $giaSu->bangCaps()
                ->with('trinhDo:id,ten,thu_tu')
                ->latest()
                ->get()
                ->map(fn (GiasuBangCap $bangCap) => $this->giaSuHoSoService->dinhDangBangCap($bangCap)),
        ]);
    }

    public function themBangCap(Request $request): JsonResponse
    {
        $giaSu = $this->giaSuHoSoService->layHoSoGiaSu($request->user());

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

        $duongDan = $this->giaSuFileService->luuFileBangCap($giaSu, $request->file('tai_lieu'));

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
            $this->giaSuFileService->xoaFileBangCap($duongDan);
            throw $exception;
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã thêm tài liệu và gửi xét duyệt.',
            'data' => $this->giaSuHoSoService->dinhDangBangCap($bangCap),
        ], 201);
    }

    public function xemBangCap(Request $request, int $bangCapId)
    {
        $giaSu = $this->giaSuHoSoService->layHoSoGiaSu($request->user());

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

        if (! $this->giaSuFileService->fileBangCapTonTai($bangCap->file_url)) {
            return response()->json([
                'success' => false,
                'message' => 'File tài liệu không còn tồn tại.',
            ], 404);
        }

        return response()->file(
            $this->giaSuFileService->duongDanFileBangCap($bangCap->file_url),
            ['Content-Disposition' => 'inline'],
        );
    }

    public function xoaBangCap(Request $request, int $bangCapId): JsonResponse
    {
        $giaSu = $this->giaSuHoSoService->layHoSoGiaSu($request->user());

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
        $this->giaSuFileService->xoaFileBangCap($duongDan);

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa bằng cấp hoặc chứng chỉ.',
        ]);
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
}

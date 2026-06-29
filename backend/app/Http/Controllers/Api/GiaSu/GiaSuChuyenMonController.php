<?php

namespace App\Http\Controllers\Api\GiaSu;

use App\Http\Controllers\Controller;
use App\Models\MucKinhNghiem;
use App\Models\TrinhDoGiasu;
use App\Services\GiaSuHoSoService;
use App\Services\GiaTinhService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GiaSuChuyenMonController extends Controller
{
    public function __construct(
        private readonly GiaSuHoSoService $giaSuHoSoService,
    ) {
    }

    public function chuyenMon(Request $request): JsonResponse
    {
        $giaSu = $this->giaSuHoSoService->layHoSoGiaSu($request->user());

        if (! $giaSu) {
            return $this->phanHoiKhongCoHoSo($request);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'thong_tin' => $this->giaSuHoSoService->dinhDangChuyenMon($giaSu),
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
        $giaSu = $this->giaSuHoSoService->layHoSoGiaSu($request->user());

        if (! $giaSu) {
            return $this->phanHoiKhongCoHoSo($request);
        }

        $duLieu = $request->validate([
            'muc_kinh_nghiem_id' => [
                'required',
                'integer',
                'exists:muc_kinh_nghiem,id',
            ],
        ], [
            'muc_kinh_nghiem_id.required' => 'Vui lòng chọn mức kinh nghiệm.',
            'muc_kinh_nghiem_id.exists' => 'Mức kinh nghiệm không hợp lệ.',
        ]);

        DB::transaction(function () use ($duLieu, $giaSu) {
            $giaSu->update([
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
            'message' => 'Cập nhật kinh nghiệm giảng dạy thành công.',
            'data' => $this->giaSuHoSoService->dinhDangChuyenMon($giaSu->fresh()),
        ]);
    }

    private function phanHoiKhongCoHoSo(Request $request): JsonResponse
    {
        $laGiaSu = $request->user()?->vai_tro === 'giasu';

        return response()->json([
            'success' => false,
            'message' => $laGiaSu
                ? 'Không tìm thấy hồ sơ gia sư.'
                : 'Chỉ tài khoản gia sư mới có thể quản lý chuyên môn.',
        ], $laGiaSu ? 404 : 403);
    }
}

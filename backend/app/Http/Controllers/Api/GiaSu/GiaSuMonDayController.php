<?php

namespace App\Http\Controllers\Api\GiaSu;

use App\Http\Controllers\Controller;
use App\Models\CapHoc;
use App\Models\GiasuGia;
use App\Models\GoiHoc;
use App\Models\MonHoc;
use App\Models\ThongBao;
use App\Models\User;
use App\Services\GiaSuHoSoService;
use App\Services\GiaSuMonDayService;
use App\Services\GiaTinhService;
use App\Services\NhatKyHeThongService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GiaSuMonDayController extends Controller
{
    public function __construct(
        private readonly GiaSuHoSoService $giaSuHoSoService,
        private readonly GiaSuMonDayService $giaSuMonDayService,
    ) {
    }

    public function danhSachMonDay(Request $request): JsonResponse
    {
        $giaSu = $this->giaSuHoSoService->layHoSoGiaSu($request->user());

        if (! $giaSu) {
            return $this->phanHoiKhongCoHoSo($request);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'mon_da_dang_ky' => $this->giaSuMonDayService->danhSachMonDaDangKy($giaSu),
                'mon_co_the_them' => $this->giaSuMonDayService->danhSachMonCoTheThem($giaSu),
                'cap_hoc' => CapHoc::query()
                    ->orderBy('thu_tu')
                    ->orderBy('id')
                    ->get(['id', 'ten']),
            ],
        ]);
    }

    public function themMonDay(Request $request): JsonResponse
    {
        $giaSu = $this->giaSuHoSoService->layHoSoGiaSu($request->user());

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

        $coHoSoXacMinhDaDuyet = $giaSu->bangCaps()
            ->where('trang_thai', 'duyet')
            ->exists();

        if (! $coHoSoXacMinhDaDuyet) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn cần có ít nhất một bằng cấp hoặc chứng chỉ đã được xác minh trước khi thêm môn dạy.',
            ], 422);
        }

        $monDaiDien = MonHoc::query()
            ->whereIn('id', $duLieu['mon_hoc_ids'])
            ->get(['id', 'cap_hoc_id', 'ten_mon']);

        if ($monDaiDien->count() !== count($duLieu['mon_hoc_ids'])) {
            return response()->json([
                'success' => false,
                'message' => 'Có môn học không hợp lệ.',
            ], 422);
        }

        $monHopLe = $this->giaSuMonDayService->layTatCaMonTheoCapVaTen($duLieu['mon_hoc_ids']);

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

        $tenMon = $monDaiDien
            ->pluck('ten_mon')
            ->unique()
            ->take(3)
            ->join(', ');

        $this->thongBaoChoAdmin(
            'Yêu cầu thêm môn dạy mới',
            ($giaSu->user?->ho_ten ?? 'Gia sư') . ' vừa gửi yêu cầu thêm môn dạy' . ($tenMon ? ': ' . $tenMon : '.'),
        );

        NhatKyHeThongService::ghi(
            $request->user(),
            'them_mon_day_gia_su',
            $giaSu->id,
            ($giaSu->user?->ho_ten ?? 'Gia sư') . ' gửi yêu cầu thêm môn dạy' . ($tenMon ? ': ' . $tenMon : '.'),
        );

        return response()->json([
            'success' => true,
            'message' => 'Đã thêm môn dạy và gửi xét duyệt.',
        ], 201);
    }

    public function xoaMonDay(Request $request, int $mucGiaId): JsonResponse
    {
        $giaSu = $this->giaSuHoSoService->layHoSoGiaSu($request->user());

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

        $monHocIds = $cacMucCungMon->pluck('monhoc_id')->all();
        $coGoiDangXuLy = GoiHoc::query()
            ->where('giasu_id', $giaSu->id)
            ->whereIn('monhoc_id', $monHocIds)
            ->whereIn('trang_thai', ['cho_xacnhan', 'cho_thanhtoan', 'danghoc'])
            ->exists();

        if ($coGoiDangXuLy) {
            return response()->json([
                'success' => false,
                'message' => 'Môn học này đang có gói học hoặc lịch học đang xử lý, không thể ngừng dạy.',
            ], 422);
        }

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

    private function phanHoiKhongCoHoSo(Request $request): JsonResponse
    {
        $laGiaSu = $request->user()?->vai_tro === 'giasu';

        return response()->json([
            'success' => false,
            'message' => $laGiaSu
                ? 'Không tìm thấy hồ sơ gia sư.'
                : 'Chỉ tài khoản gia sư mới có thể quản lý môn dạy.',
        ], $laGiaSu ? 404 : 403);
    }

    private function thongBaoChoAdmin(string $tieuDe, string $noiDung): void
    {
        User::query()
            ->where('vai_tro', 'admin')
            ->get(['id'])
            ->each(fn (User $admin) => ThongBao::create([
                'user_id' => $admin->id,
                'tieu_de' => $tieuDe,
                'noi_dung' => $noiDung,
                'url' => '/admin/gia-su?tab=chuyen_mon',
                'da_doc' => false,
            ]));
    }
}

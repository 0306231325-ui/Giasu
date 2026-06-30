<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Giasu;
use App\Models\GiasuGia;
use App\Models\ThongBao;
use App\Services\AdminXetDuyetGiaSuService;
use App\Services\GiaTinhService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminXetDuyetGiaSuController extends Controller
{
    public function __construct(
        private readonly AdminXetDuyetGiaSuService $adminXetDuyetGiaSuService,
    ) {
    }

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
            ->map(fn (Giasu $giaSu) => $this->adminXetDuyetGiaSuService->dinhDangHoSoChoDuyet($giaSu))
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
                $trinhDoCaoNhatId = $this->adminXetDuyetGiaSuService->layTrinhDoCaoNhatTuBangCap($giaSu);

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

                $this->adminXetDuyetGiaSuService->dongBoMonDayTheoCapVaTen($giaSu);

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
                'url' => null,
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
}

<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\DanhGia;
use App\Models\Giasu;
use App\Models\GiasuGia;
use App\Models\TrinhDoGiasu;
use App\Services\AdminGiaSuService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminGiaSuController extends Controller
{
    private const SO_GIA_SU_MOI_TRANG = 10;

    public function __construct(
        private readonly AdminGiaSuService $adminGiaSuService,
    ) {
    }

    public function danhSachGiaSu(Request $request): JsonResponse
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền truy cập.',
            ], 403);
        }

        $tuKhoa = trim((string) $request->query('q', ''));
        $trangThai = $request->query('trang_thai');
        $trangThaiHoSo = $request->query('trang_thai_ho_so', 'duyet');
        $trinhDoId = $request->integer('trinh_do_id');
        if (! in_array($trangThaiHoSo, ['duyet', 'tu_choi'], true)) {
            $trangThaiHoSo = 'duyet';
        }

        $danhSach = Giasu::query()
            ->where('trang_thai_ho_so', $trangThaiHoSo)
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
                        ->whereIn('trang_thai', [
                            GiasuGia::TRANG_THAI_DA_DUYET,
                            GiasuGia::TRANG_THAI_TU_CHOI,
                        ])
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
                ->map(fn (Giasu $giaSu) => $this->adminGiaSuService->dinhDangGiaSu($giaSu))
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
}

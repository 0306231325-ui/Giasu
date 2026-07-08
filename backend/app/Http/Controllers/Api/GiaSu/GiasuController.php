<?php

namespace App\Http\Controllers\Api\GiaSu;

use App\Http\Controllers\Controller;
use App\Models\DanhGia;
use App\Models\Giasu;
use App\Models\GiasuGia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GiasuController extends Controller
{
    private function truyVanDanhSachGiaSu()
    {
        return Giasu::query()
            ->where('trang_thai_ho_so', 'duyet')
            ->with([
                'user:id,ho_ten,anh_dai_dien,sdt',
                'trinhDo:id,ten',
                'mucKinhNghiem:id,tu_khoang,den_khoang',
                'giasuGias' => function ($query) {
                    $query
                        ->select(
                            'id',
                            'giasu_id',
                            'monhoc_id',
                            'gia_mon',
                            'gia_cong_trinh_do',
                            'gia_cong_kinh_nghiem',
                            'gia_cong_them',
                            'tong_gia',
                            'trang_thai',
                        )
                        ->where('trang_thai', GiasuGia::TRANG_THAI_DA_DUYET)
                        ->orderBy('tong_gia');
                },
                'giasuGias.monHoc:id,ten_mon,cap_hoc_id,lop',
                'giasuGias.monHoc.capHoc:id,ten,thu_tu',
            ])
            ->withCount([
                'lichHocs as danh_gias_count' => function ($query) {
                    $query->whereHas('danhGia');
                },
            ])
            ->withMin([
                'giasuGias as gia_tu' => fn ($query) => $query->where('trang_thai', GiasuGia::TRANG_THAI_DA_DUYET),
            ], 'tong_gia')
            ->withMax([
                'giasuGias as gia_den' => fn ($query) => $query->where('trang_thai', GiasuGia::TRANG_THAI_DA_DUYET),
            ], 'tong_gia')
            ->addSelect([
                'danh_gias_avg_so_sao' => DanhGia::selectRaw('coalesce(avg(danhgia.so_sao), 0)')
                    ->join('lichhoc', 'lichhoc.id', '=', 'danhgia.lichhoc_id')
                    ->join('goihoc', 'goihoc.id', '=', 'lichhoc.goihoc_id')
                    ->whereColumn('goihoc.giasu_id', 'giasu.id')
                    ->limit(1),
            ]);
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $duLieu = $request->validate([
                'monhoc_id' => ['nullable', 'integer', 'exists:monhoc,id'],
            ]);

            $query = $this->truyVanDanhSachGiaSu();

            if (! empty($duLieu['monhoc_id'])) {
                $query->whereHas('giasuGias', function ($giaQuery) use ($duLieu) {
                    $giaQuery
                        ->where('monhoc_id', $duLieu['monhoc_id'])
                        ->where('trang_thai', GiasuGia::TRANG_THAI_DA_DUYET);
                });
            }

            $danhSachGiaSu = $query
                ->orderBy('id', 'desc')
                ->paginate(12);

            return response()->json([
                'success' => true,
                'message' => 'Lấy danh sách gia sư thành công',
                'data' => $danhSachGiaSu,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function timTheoYeuCau(Request $request): JsonResponse
    {
        $duLieu = $request->validate([
            'monhoc_id' => ['nullable', 'integer', 'exists:monhoc,id'],
            'cap_hoc_id' => ['nullable', 'integer', 'exists:cap_hoc,id'],
            'ten_mon' => ['nullable', 'string', 'max:100'],
            'lop' => ['nullable', 'string', 'max:50'],
            'ngan_sach' => ['nullable', 'numeric', 'min:0'],
            'hinh_thuc' => ['nullable', 'in:online,offline'],
            'muc_tieu' => ['nullable', 'string', 'max:255'],
            'thoi_gian' => ['nullable', 'string', 'max:255'],
            'ghi_chu' => ['nullable', 'string', 'max:1000'],
        ]);

        $tuKhoa = trim((string) ($duLieu['ghi_chu'] ?? ''));

        $query = $this->truyVanDanhSachGiaSu();

        if (! empty($duLieu['monhoc_id']) || ! empty($duLieu['cap_hoc_id']) || ! empty($duLieu['ten_mon']) || ! empty($duLieu['lop'])) {
            $query->whereHas('giasuGias', function ($giaQuery) use ($duLieu) {
                $giaQuery->where('trang_thai', GiasuGia::TRANG_THAI_DA_DUYET);

                if (! empty($duLieu['monhoc_id'])) {
                    $giaQuery->where('monhoc_id', $duLieu['monhoc_id']);
                }

                if (! empty($duLieu['cap_hoc_id']) || ! empty($duLieu['ten_mon']) || ! empty($duLieu['lop'])) {
                    $giaQuery->whereHas('monHoc', function ($monQuery) use ($duLieu) {
                        if (! empty($duLieu['cap_hoc_id'])) {
                            $monQuery->where('cap_hoc_id', $duLieu['cap_hoc_id']);
                        }

                        if (! empty($duLieu['ten_mon'])) {
                            $monQuery->where('ten_mon', $duLieu['ten_mon']);
                        }

                        if (! empty($duLieu['lop'])) {
                            $monQuery->where('lop', $duLieu['lop']);
                        }
                    });
                }
            });
        }

        if (! empty($duLieu['ngan_sach'])) {
            $query->whereHas('giasuGias', function ($giaQuery) use ($duLieu) {
                $giaQuery
                    ->where('tong_gia', '<=', $duLieu['ngan_sach'])
                    ->where('trang_thai', GiasuGia::TRANG_THAI_DA_DUYET);
            });
        }

        if ($tuKhoa !== '') {
            $query->where(function ($subQuery) use ($tuKhoa) {
                $subQuery
                    ->where('mo_ta', 'like', "%{$tuKhoa}%")
                    ->orWhere('dia_chi', 'like', "%{$tuKhoa}%")
                    ->orWhereHas('trinhDo', function ($trinhDoQuery) use ($tuKhoa) {
                        $trinhDoQuery->where('ten', 'like', "%{$tuKhoa}%");
                    })
                    ->orWhereHas('user', function ($userQuery) use ($tuKhoa) {
                        $userQuery->where('ho_ten', 'like', "%{$tuKhoa}%");
                    });
            });
        }

        $danhSach = $query
            ->orderByDesc('danh_gias_avg_so_sao')
            ->orderBy('gia_tu')
            ->orderByDesc('id')
            ->limit(12)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Gợi ý gia sư theo yêu cầu thành công',
            'data' => $danhSach,
        ]);
    }

    public function demCanXuLy(Request $request): JsonResponse
    {
        $giaSu = $request->user()->giasu;
        
        if (!$giaSu) {
            return response()->json([
                'success' => true,
                'data' => [
                    'lichDay' => 0,
                    'hoSo' => 0,
                ],
            ]);
        }

        $soYeuCauDatGoi = \App\Models\GoiHoc::query()
            ->where('giasu_id', $giaSu->id)
            ->where('trang_thai', 'cho_xacnhan')
            ->whereNotNull('gui_giasu_luc')
            ->count();

        $soYeuCauDoiBuoi = \App\Models\YeuCauHocBu::query()
            ->where('giasu_id', $giaSu->id)
            ->where('trang_thai', 'cho_gia_su_xac_nhan')
            ->count();
            
        $soHoSo = 0;
        if (in_array($giaSu->trang_thai_ho_so, ['tu_choi', 'cho_cap_nhat'])) {
            $soHoSo = 1;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'lichDay' => $soYeuCauDatGoi + $soYeuCauDoiBuoi,
                'hoSo' => $soHoSo,
            ],
        ]);
    }
}

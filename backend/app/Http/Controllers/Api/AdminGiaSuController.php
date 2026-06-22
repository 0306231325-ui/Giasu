<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DanhGia;
use App\Models\Giasu;
use App\Models\GiasuGia;
use App\Models\TrinhDoGiasu;
use Illuminate\Http\Request;

class AdminGiaSuController extends Controller
{
    private const SO_GIA_SU_MOI_TRANG = 10;

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

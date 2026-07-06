<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\NhatKyHeThong;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminNhatKyHeThongController extends Controller
{
    private const SO_DONG_MOI_TRANG = 10;

    private const NHOM_HANH_DONG = [
        'tai_khoan' => ['khoa_tai_khoan', 'mo_khoa_tai_khoan'],
        'ho_so' => [
            'gui_don_dang_ky_gia_su',
            'duyet_ho_so_gia_su',
            'tu_choi_ho_so_gia_su',
            'duyet_yeu_cau_chuyen_mon',
            'tu_choi_yeu_cau_chuyen_mon',
        ],
        'dat_goi' => [
            'dat_goi_hoc',
            'gui_yeu_cau_cho_gia_su',
            'chuyen_cho_thanh_toan',
            'gia_su_dong_y',
            'gia_su_tu_choi',
            'huy_goi_hoc',
        ],
        'thanh_toan' => [
            'gui_minh_chung_thanh_toan',
            'duyet_thanh_toan',
            'tu_choi_thanh_toan',
        ],
        'lich_hoc' => [
            'tao_lich_hoc',
            'xac_nhan_hoan_thanh_buoi_hoc',
            'huy_buoi_hoc',
            'yeu_cau_doi_buoi',
        ],
        'bai_viet' => ['tao_bai_viet', 'sua_bai_viet', 'xoa_bai_viet'],
        'danh_muc' => ['them_danh_muc', 'sua_danh_muc', 'xoa_danh_muc'],
    ];

    public function index(Request $request): JsonResponse
    {
        $duLieu = $request->validate([
            'tu_khoa' => ['nullable', 'string', 'max:255'],
            'vai_tro' => ['nullable', 'string', 'in:admin,giasu,hocvien'],
            'nhom_hanh_dong' => ['nullable', 'string', 'in:tai_khoan,ho_so,dat_goi,thanh_toan,lich_hoc,bai_viet,danh_muc'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $query = NhatKyHeThong::query()
            ->with(['user:id,ho_ten,email,vai_tro'])
            ->latest('created_at')
            ->latest('id');

        if (!empty($duLieu['vai_tro'])) {
            $query->where('vai_tro', $duLieu['vai_tro']);
        }

        if (!empty($duLieu['nhom_hanh_dong'])) {
            $query->whereIn('hanh_dong', self::NHOM_HANH_DONG[$duLieu['nhom_hanh_dong']] ?? []);
        }

        if (!empty($duLieu['tu_khoa'])) {
            $tuKhoa = trim($duLieu['tu_khoa']);

            $query->where(function ($truyVan) use ($tuKhoa) {
                $truyVan
                    ->where('noi_dung', 'like', "%{$tuKhoa}%")
                    ->orWhere('hanh_dong', 'like', "%{$tuKhoa}%")
                    ->orWhere('doi_tuong_id', 'like', "%{$tuKhoa}%")
                    ->orWhereHas('user', function ($userQuery) use ($tuKhoa) {
                        $userQuery
                            ->where('ho_ten', 'like', "%{$tuKhoa}%")
                            ->orWhere('email', 'like', "%{$tuKhoa}%");
                    });
            });
        }

        $nhatKy = $query->paginate(self::SO_DONG_MOI_TRANG);

        return response()->json([
            'data' => collect($nhatKy->items())->map(function (NhatKyHeThong $item) {
                return [
                    'id' => $item->id,
                    'user_id' => $item->user_id,
                    'nguoi_thuc_hien' => $item->user?->ho_ten ?? 'Hệ thống',
                    'email' => $item->user?->email,
                    'vai_tro' => $item->vai_tro,
                    'hanh_dong' => $item->hanh_dong,
                    'doi_tuong_id' => $item->doi_tuong_id,
                    'noi_dung' => $item->noi_dung,
                    'created_at' => optional($item->created_at)->timezone('Asia/Ho_Chi_Minh')->format('d/m/Y H:i'),
                ];
            }),
            'meta' => [
                'current_page' => $nhatKy->currentPage(),
                'last_page' => $nhatKy->lastPage(),
                'per_page' => $nhatKy->perPage(),
                'total' => $nhatKy->total(),
            ],
        ]);
    }
}

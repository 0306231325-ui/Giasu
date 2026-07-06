<?php

namespace App\Http\Controllers\Api\DatGoi;

use App\Http\Controllers\Api\DatLich\DatLichBaseController;
use App\Models\Giasu;
use App\Models\GiasuGia;
use App\Models\GoiHoc;
use App\Models\DanhGia;
use App\Models\LichHoc;
use App\Models\LoaiGoi;
use App\Models\PhanHoi;
use App\Models\ThanhToan;
use App\Models\ThongBao;
use App\Models\User;
use App\Models\YeuCauHocBu;
use App\Services\NhatKyHeThongService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\Rule;

class GiaSuYeuCauDatGoiController extends DatLichBaseController
{
    public function danhSachYeuCauGiaSu(Request $request): JsonResponse
    {
        $giaSu = $this->layGiaSuDangNhap($request);

        if (! $giaSu) {
            return response()->json([
                'success' => false,
                'message' => 'Khu vuc nay chi danh cho tai khoan gia su.',
            ], 403);
        }

        $danhSach = GoiHoc::query()
            ->with([
                'hocVien:id,ho_ten,email,sdt',
                'monHoc:id,ten_mon,lop',
                'lichHocs' => fn ($query) => $query->orderBy('ngay_hoc')->orderBy('gio_batdau'),
                'phanHoiMoiNhat',
            ])
            ->where('giasu_id', $giaSu->id)
            ->where(function ($query) use ($giaSu) {
                $query
                    ->where(function ($dangXuLyQuery) {
                        $dangXuLyQuery
                            ->whereIn('trang_thai', ['cho_xacnhan', 'cho_thanhtoan'])
                            ->whereNotNull('gui_giasu_luc');
                    })
                    ->orWhere(function ($huyQuery) use ($giaSu) {
                        $huyQuery
                            ->where('trang_thai', 'dahuy')
                            ->whereHas('phanHois', function ($phanHoiQuery) use ($giaSu) {
                                $phanHoiQuery
                                    ->where('gia_su_id', $giaSu->id)
                                    ->where('phan_hoi', PhanHoi::TU_CHOI);
                            });
                    });
            })
            ->latest()
            ->get()
            ->map(fn (GoiHoc $goiHoc) => $this->dinhDangYeuCauChoGiaSu($goiHoc))
            ->values();

        return response()->json([
            'success' => true,
            'data' => $danhSach,
        ]);
    }
    public function phanHoiYeuCauGiaSu(Request $request, int $goiHocId): JsonResponse
    {
        $giaSu = $this->layGiaSuDangNhap($request);

        if (! $giaSu) {
            return response()->json([
                'success' => false,
                'message' => 'Khu vuc nay chi danh cho tai khoan gia su.',
            ], 403);
        }

        $duLieu = $request->validate([
            'phan_hoi' => ['required', Rule::in([PhanHoi::DONG_Y, PhanHoi::TU_CHOI])],
            'ly_do' => ['required_if:phan_hoi,' . PhanHoi::TU_CHOI, 'nullable', 'string', 'max:1000'],
        ]);

        $goiHoc = GoiHoc::query()
            ->with(['hocVien:id,ho_ten', 'monHoc:id,ten_mon,lop', 'giasu.user:id,ho_ten', 'lichHocs'])
            ->where('giasu_id', $giaSu->id)
            ->where('trang_thai', 'cho_xacnhan')
            ->find($goiHocId);

        if (! $goiHoc) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay yeu cau dang cho phan hoi.',
            ], 404);
        }

        $laTuChoi = $duLieu['phan_hoi'] === PhanHoi::TU_CHOI;
        $lyDo = filled($duLieu['ly_do'] ?? null) ? trim($duLieu['ly_do']) : null;

        DB::transaction(function () use ($goiHoc, $giaSu, $duLieu, $laTuChoi, $lyDo) {
            $phanHoiDaCo = PhanHoi::query()
                ->where('gia_su_id', $giaSu->id)
                ->where('goi_hoc_id', $goiHoc->id)
                ->lockForUpdate()
                ->first();

            if ($phanHoiDaCo) {
                abort(response()->json([
                    'success' => false,
                    'message' => 'Ban da phan hoi yeu cau nay roi.',
                ], 422));
            }

            if (! $laTuChoi) {
                foreach ($goiHoc->lichHocs as $lichHoc) {
                    if ($this->coLichTrungCuaGiaSu($giaSu->id, [
                        'ngay_hoc' => Carbon::parse($lichHoc->ngay_hoc)->toDateString(),
                        'gio_batdau' => substr((string) $lichHoc->gio_batdau, 0, 5),
                        'gio_ketthuc' => substr((string) $lichHoc->gio_ketthuc, 0, 5),
                    ])) {
                        abort(response()->json([
                            'success' => false,
                            'message' => 'Khung gio ' . Carbon::parse($lichHoc->ngay_hoc)->format('d/m/Y')
                                . ' ' . substr((string) $lichHoc->gio_batdau, 0, 5)
                                . ' - ' . substr((string) $lichHoc->gio_ketthuc, 0, 5)
                                . ' da co yeu cau hoac goi hoc khac duoc xac nhan.',
                        ], 422));
                    }
                }
            }

            PhanHoi::create([
                'gia_su_id' => $giaSu->id,
                'goi_hoc_id' => $goiHoc->id,
                'phan_hoi' => $duLieu['phan_hoi'],
                'ly_do' => $laTuChoi ? $lyDo : null,
            ]);

            if ($laTuChoi) {
                $goiHoc->update([
                    'trang_thai' => 'dahuy',
                ]);

                $goiHoc->lichHocs()->update([
                    'trang_thai' => 'dahuy',
                    'lydo_huy' => $lyDo,
                ]);
            } else {
                $goiHoc->update([
                    'trang_thai' => 'cho_thanhtoan',
                ]);
            }

            User::query()
                ->where('vai_tro', 'admin')
                ->get(['id'])
                ->each(fn (User $admin) => ThongBao::create([
                    'user_id' => $admin->id,
                    'tieu_de' => $laTuChoi ? 'Gia sư từ chối yêu cầu' : 'Gia sư đồng ý yêu cầu',
                    'noi_dung' => ($goiHoc->giasu?->user?->ho_ten ?? 'Gia sư')
                        . ($laTuChoi ? ' đã từ chối ' : ' đã đồng ý ')
                        . 'yêu cầu ' . 'GH' . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT)
                        . ($laTuChoi && $lyDo ? '. Lý do: ' . $lyDo : '.'),
                    'url' => '/admin/quan-ly-dat-goi',
                    'da_doc' => false,
                ]));

            ThongBao::create([
                'user_id' => $goiHoc->hocvien_id,
                'tieu_de' => $laTuChoi ? 'Gia sư đã từ chối yêu cầu' : 'Gia sư đã đồng ý nhận lớp',
                'noi_dung' => $laTuChoi
                    ? 'Gia sư đã từ chối yêu cầu đặt gói của bạn' . ($lyDo ? ': ' . $lyDo : '.')
                    : 'Gia sư đã đồng ý nhận lớp. Bạn có thể tiến hành thanh toán gói học.',
                'url' => '/hoc-vien/lich-hoc',
                'da_doc' => false,
            ]);
        });

        NhatKyHeThongService::ghi(
            $request->user(),
            $laTuChoi ? 'gia_su_tu_choi' : 'gia_su_dong_y',
            $goiHoc->id,
            $laTuChoi
                ? ($request->user()->ho_ten . " từ chối yêu cầu đặt gói GH" . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT) . ($lyDo ? ". Lý do: {$lyDo}" : "."))
                : ($request->user()->ho_ten . " đồng ý nhận yêu cầu đặt gói GH" . str_pad((string) $goiHoc->id, 6, '0', STR_PAD_LEFT) . ".")
        );

        $goiHocMoi = $goiHoc->fresh(['hocVien:id,ho_ten,email,sdt', 'monHoc:id,ten_mon,lop', 'lichHocs', 'phanHoiMoiNhat']);

        return response()->json([
            'success' => true,
            'message' => $laTuChoi ? 'Đã từ chối yêu cầu đặt gói.' : 'Đã đồng ý nhận lớp. Gói học đã chuyển sang chờ thanh toán.',
            'data' => $this->dinhDangYeuCauChoGiaSu($goiHocMoi),
        ]);
    }
}

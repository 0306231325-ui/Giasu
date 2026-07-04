<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CapHoc;
use App\Models\LoaiGoi;
use App\Models\MucKinhNghiem;
use App\Models\TrinhDoGiasu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminDanhMucController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if (! $this->laAdmin($request)) {
            return $this->khongCoQuyen();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'cap_hoc' => CapHoc::query()
                    ->withCount(['monHocs', 'giasus'])
                    ->orderBy('thu_tu')
                    ->orderBy('id')
                    ->get()
                    ->map(fn (CapHoc $capHoc) => [
                        'id' => $capHoc->id,
                        'ma' => $capHoc->ma,
                        'ten' => $capHoc->ten,
                        'thu_tu' => (int) $capHoc->thu_tu,
                        'so_mon_hoc' => (int) $capHoc->mon_hocs_count,
                        'so_gia_su' => (int) $capHoc->giasus_count,
                    ]),
                'loai_goi' => LoaiGoi::query()
                    ->withCount('goiHocs')
                    ->orderBy('so_thang')
                    ->orderBy('id')
                    ->get()
                    ->map(fn (LoaiGoi $loaiGoi) => [
                        'id' => $loaiGoi->id,
                        'ten_loai_goi' => $loaiGoi->ten_loai_goi,
                        'so_thang' => (int) $loaiGoi->so_thang,
                        'phan_tram_giam' => (float) $loaiGoi->phan_tram_giam,
                        'mo_ta' => $loaiGoi->mo_ta,
                        'so_goi_hoc' => (int) $loaiGoi->goi_hocs_count,
                    ]),
                'trinh_do_giasu' => TrinhDoGiasu::query()
                    ->withCount('giasus')
                    ->orderBy('thu_tu')
                    ->orderBy('id')
                    ->get()
                    ->map(fn (TrinhDoGiasu $trinhDo) => [
                        'id' => $trinhDo->id,
                        'ma' => $trinhDo->ma,
                        'ten' => $trinhDo->ten,
                        'gia_cong_them' => (float) $trinhDo->gia_cong_them,
                        'thu_tu' => (int) $trinhDo->thu_tu,
                        'so_gia_su' => (int) $trinhDo->giasus_count,
                    ]),
                'muc_kinh_nghiem' => MucKinhNghiem::query()
                    ->withCount('giasus')
                    ->orderBy('tu_khoang')
                    ->orderBy('id')
                    ->get()
                    ->map(fn (MucKinhNghiem $muc) => [
                        'id' => $muc->id,
                        'tu_khoang' => (int) $muc->tu_khoang,
                        'den_khoang' => $muc->den_khoang !== null ? (int) $muc->den_khoang : null,
                        'gia_cong_them' => (float) $muc->gia_cong_them,
                        'so_gia_su' => (int) $muc->giasus_count,
                    ]),
            ],
        ]);
    }

    public function store(Request $request, string $loai): JsonResponse
    {
        if (! $this->laAdmin($request)) {
            return $this->khongCoQuyen();
        }

        $duLieu = $this->chuanHoaDuLieu($loai, $this->validateDanhMuc($request, $loai));
        $model = $this->modelClass($loai)::create($duLieu);

        return response()->json([
            'success' => true,
            'message' => 'Da them danh muc.',
            'data' => $model,
        ], 201);
    }

    public function update(Request $request, string $loai, int $id): JsonResponse
    {
        if (! $this->laAdmin($request)) {
            return $this->khongCoQuyen();
        }

        $modelClass = $this->modelClass($loai);
        $model = $modelClass::query()->find($id);

        if (! $model) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay danh muc.',
            ], 404);
        }

        $model->update($this->chuanHoaDuLieu($loai, $this->validateDanhMuc($request, $loai, $id)));

        return response()->json([
            'success' => true,
            'message' => 'Da cap nhat danh muc.',
            'data' => $model->fresh(),
        ]);
    }

    public function destroy(Request $request, string $loai, int $id): JsonResponse
    {
        if (! $this->laAdmin($request)) {
            return $this->khongCoQuyen();
        }

        $modelClass = $this->modelClass($loai);
        $model = $modelClass::query()->find($id);

        if (! $model) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay danh muc.',
            ], 404);
        }

        if ($this->dangDuocSuDung($loai, $id)) {
            return response()->json([
                'success' => false,
                'message' => 'Danh muc nay dang duoc su dung, khong the xoa.',
            ], 422);
        }

        $model->delete();

        return response()->json([
            'success' => true,
            'message' => 'Da xoa danh muc.',
        ]);
    }

    private function validateDanhMuc(Request $request, string $loai, ?int $id = null): array
    {
        return match ($loai) {
            'cap-hoc' => $request->validate([
                'ma' => ['required', 'string', 'max:50', Rule::unique('cap_hoc', 'ma')->ignore($id)],
                'ten' => ['required', 'string', 'max:100'],
                'thu_tu' => ['nullable', 'integer', 'min:0', 'max:9999'],
            ]),
            'loai-goi' => $request->validate([
                'ten_loai_goi' => ['required', 'string', 'max:100'],
                'so_thang' => ['required', 'integer', 'min:0', 'max:120', Rule::unique('loai_goi', 'so_thang')->ignore($id)],
                'phan_tram_giam' => ['nullable', 'numeric', 'min:0', 'max:100'],
                'mo_ta' => ['nullable', 'string', 'max:255'],
            ]),
            'trinh-do-gia-su' => $request->validate([
                'ma' => ['required', 'string', 'max:80', Rule::unique('trinh_do_giasu', 'ma')->ignore($id)],
                'ten' => ['required', 'string', 'max:150'],
                'gia_cong_them' => ['nullable', 'numeric', 'min:0', 'max:999999999'],
                'thu_tu' => ['nullable', 'integer', 'min:0', 'max:9999'],
            ]),
            'muc-kinh-nghiem' => $request->validate([
                'tu_khoang' => ['required', 'integer', 'min:0', 'max:100'],
                'den_khoang' => ['nullable', 'integer', 'min:0', 'max:100', 'gte:tu_khoang'],
                'gia_cong_them' => ['nullable', 'numeric', 'min:0', 'max:999999999'],
            ]),
            default => abort(404),
        };
    }

    private function modelClass(string $loai): string
    {
        return match ($loai) {
            'cap-hoc' => CapHoc::class,
            'loai-goi' => LoaiGoi::class,
            'trinh-do-gia-su' => TrinhDoGiasu::class,
            'muc-kinh-nghiem' => MucKinhNghiem::class,
            default => abort(404),
        };
    }

    private function chuanHoaDuLieu(string $loai, array $duLieu): array
    {
        return match ($loai) {
            'cap-hoc' => [
                'ma' => trim($duLieu['ma']),
                'ten' => trim($duLieu['ten']),
                'thu_tu' => (int) ($duLieu['thu_tu'] ?? 0),
            ],
            'loai-goi' => [
                'ten_loai_goi' => trim($duLieu['ten_loai_goi']),
                'so_thang' => (int) $duLieu['so_thang'],
                'phan_tram_giam' => (float) ($duLieu['phan_tram_giam'] ?? 0),
                'mo_ta' => filled($duLieu['mo_ta'] ?? null) ? trim($duLieu['mo_ta']) : null,
            ],
            'trinh-do-gia-su' => [
                'ma' => trim($duLieu['ma']),
                'ten' => trim($duLieu['ten']),
                'gia_cong_them' => (float) ($duLieu['gia_cong_them'] ?? 0),
                'thu_tu' => (int) ($duLieu['thu_tu'] ?? 0),
            ],
            'muc-kinh-nghiem' => [
                'tu_khoang' => (int) $duLieu['tu_khoang'],
                'den_khoang' => array_key_exists('den_khoang', $duLieu) && $duLieu['den_khoang'] !== null ? (int) $duLieu['den_khoang'] : null,
                'gia_cong_them' => (float) ($duLieu['gia_cong_them'] ?? 0),
            ],
            default => $duLieu,
        };
    }

    private function dangDuocSuDung(string $loai, int $id): bool
    {
        return match ($loai) {
            'cap-hoc' => DB::table('monhoc')->where('cap_hoc_id', $id)->exists()
                || DB::table('giasu_cap_hoc')->where('cap_hoc_id', $id)->exists(),
            'loai-goi' => DB::table('goihoc')->where('loai_goi_id', $id)->exists(),
            'trinh-do-gia-su' => DB::table('giasu')->where('trinh_do_giasu_id', $id)->exists()
                || DB::table('giasu_bang_cap')->where('trinh_do_giasu_id', $id)->exists(),
            'muc-kinh-nghiem' => DB::table('giasu')->where('muc_kinh_nghiem_id', $id)->exists(),
            default => true,
        };
    }

    private function laAdmin(Request $request): bool
    {
        return $request->user()?->vai_tro === 'admin';
    }

    private function khongCoQuyen(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Ban khong co quyen truy cap.',
        ], 403);
    }
}

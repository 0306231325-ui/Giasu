<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CapHoc;
use App\Models\MonHoc;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MonHocController extends Controller
{
    public function index()
    {
        try {
            $danhSachMonHoc = MonHoc::query()
                ->with('capHoc:id,ten,thu_tu')
                ->select('id', 'ten_mon', 'mo_ta', 'cap_hoc_id', 'lop')
                ->orderBy('cap_hoc_id')
                ->orderBy('lop')
                ->orderBy('ten_mon')
                ->get()
                ->map(function ($mon) {
                    $mon->giasus_count = DB::table('giasu_gia')
                        ->where('monhoc_id', $mon->id)
                        ->distinct('giasu_gia.giasu_id')
                        ->count('giasu_gia.giasu_id');

                    return $mon;
                });

            return response()->json([
                'success' => true,
                'message' => 'Lấy danh sách môn học thành công',
                'data' => $danhSachMonHoc,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function danhSachAdmin(Request $request): JsonResponse
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Ban khong co quyen truy cap.',
            ], 403);
        }

        $tuKhoa = trim((string) $request->query('q', ''));
        $capHocId = $request->query('cap_hoc_id');

        $danhSach = MonHoc::query()
            ->with('capHoc:id,ten,thu_tu')
            ->when($tuKhoa !== '', function ($query) use ($tuKhoa) {
                $query->where(function ($subQuery) use ($tuKhoa) {
                    $subQuery
                        ->where('ten_mon', 'like', "%{$tuKhoa}%")
                        ->orWhere('lop', 'like', "%{$tuKhoa}%")
                        ->orWhere('mo_ta', 'like', "%{$tuKhoa}%");
                });
            })
            ->when($capHocId, fn ($query) => $query->where('cap_hoc_id', $capHocId))
            ->withCount([
                'giasuGias as so_gia_su',
            ])
            ->orderBy('cap_hoc_id')
            ->orderBy('lop')
            ->orderBy('ten_mon')
            ->get()
            ->map(fn (MonHoc $monHoc) => $this->dinhDangMonHocAdmin($monHoc))
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'mon_hoc' => $danhSach,
                'cap_hoc' => CapHoc::query()
                    ->select('id', 'ten')
                    ->orderBy('thu_tu')
                    ->get(),
            ],
        ]);
    }

    public function taoAdmin(Request $request): JsonResponse
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Ban khong co quyen truy cap.',
            ], 403);
        }

        $duLieu = $this->validateMonHocAdmin($request);

        $monHoc = MonHoc::create($duLieu);

        return response()->json([
            'success' => true,
            'message' => 'Da them mon hoc.',
            'data' => $this->dinhDangMonHocAdmin($monHoc->load('capHoc')->loadCount('giasuGias as so_gia_su')),
        ], 201);
    }

    public function capNhatAdmin(Request $request, int $monHocId): JsonResponse
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Ban khong co quyen truy cap.',
            ], 403);
        }

        $monHoc = MonHoc::query()->find($monHocId);

        if (! $monHoc) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay mon hoc.',
            ], 404);
        }

        $duLieu = $this->validateMonHocAdmin($request, $monHoc->id);
        $monHoc->update($duLieu);

        return response()->json([
            'success' => true,
            'message' => 'Da cap nhat mon hoc.',
            'data' => $this->dinhDangMonHocAdmin($monHoc->fresh(['capHoc'])->loadCount('giasuGias as so_gia_su')),
        ]);
    }

    public function xoaAdmin(Request $request, int $monHocId): JsonResponse
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Ban khong co quyen truy cap.',
            ], 403);
        }

        $monHoc = MonHoc::query()->withCount('giasuGias')->find($monHocId);

        if (! $monHoc) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay mon hoc.',
            ], 404);
        }

        $daCoGoiHoc = DB::table('goihoc')->where('monhoc_id', $monHoc->id)->exists();

        if ($monHoc->giasu_gias_count > 0 || $daCoGoiHoc) {
            return response()->json([
                'success' => false,
                'message' => 'Mon hoc da co gia su hoac goi hoc lien quan, khong the xoa.',
            ], 422);
        }

        $monHoc->delete();

        return response()->json([
            'success' => true,
            'message' => 'Da xoa mon hoc.',
        ]);
    }

    private function validateMonHocAdmin(Request $request, ?int $ignoreId = null): array
    {
        $duLieu = $request->validate([
            'ten_mon' => ['required', 'string', 'max:100'],
            'cap_hoc_id' => ['nullable', 'integer', 'exists:cap_hoc,id'],
            'lop' => ['nullable', 'string', 'max:50'],
            'gia' => ['nullable', 'numeric', 'min:0', 'max:999999999'],
            'mo_ta' => ['nullable', 'string', 'max:1000'],
        ]);

        $tenMon = trim($duLieu['ten_mon']);
        $lop = filled($duLieu['lop'] ?? null) ? trim($duLieu['lop']) : null;
        $capHocId = $duLieu['cap_hoc_id'] ?? null;

        $daTonTai = MonHoc::query()
            ->where('ten_mon', $tenMon)
            ->where('cap_hoc_id', $capHocId)
            ->where('lop', $lop)
            ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
            ->exists();

        if ($daTonTai) {
            abort(response()->json([
                'success' => false,
                'message' => 'Mon hoc nay da ton tai trong cap hoc va lop da chon.',
            ], 422));
        }

        return [
            'ten_mon' => $tenMon,
            'cap_hoc_id' => $capHocId,
            'lop' => $lop,
            'gia' => array_key_exists('gia', $duLieu) && $duLieu['gia'] !== null ? (float) $duLieu['gia'] : null,
            'mo_ta' => filled($duLieu['mo_ta'] ?? null) ? trim($duLieu['mo_ta']) : null,
        ];
    }

    private function dinhDangMonHocAdmin(MonHoc $monHoc): array
    {
        return [
            'id' => $monHoc->id,
            'ten_mon' => $monHoc->ten_mon,
            'mo_ta' => $monHoc->mo_ta,
            'cap_hoc_id' => $monHoc->cap_hoc_id,
            'cap_hoc' => $monHoc->capHoc?->ten,
            'lop' => $monHoc->lop,
            'gia' => $monHoc->gia !== null ? (float) $monHoc->gia : null,
            'so_gia_su' => (int) ($monHoc->so_gia_su ?? 0),
        ];
    }
}

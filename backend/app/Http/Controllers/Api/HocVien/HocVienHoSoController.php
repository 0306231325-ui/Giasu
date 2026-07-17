<?php

namespace App\Http\Controllers\Api\HocVien;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\Rule;

class HocVienHoSoController extends Controller
{
    public function hoSoHocVien(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->vai_tro !== 'hocvien') {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ tài khoản học viên mới có thể truy cập hồ sơ này.',
            ], 403);
        }

        $hocVien = $user->hocvien()->firstOrCreate([]);

        return response()->json([
            'success' => true,
            'data' => $this->formatHocVienProfile($user, $hocVien),
        ]);
    }

    public function capNhatHoSoHocVien(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->vai_tro !== 'hocvien') {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ tài khoản học viên mới có thể cập nhật hồ sơ này.',
            ], 403);
        }

        $validated = $request->validate([
            'ho_ten' => ['required', 'string', 'min:2', 'max:100'],
            'ngay_sinh' => ['nullable', 'date', 'before:today'],
            'email' => [
                'required',
                'email',
                'max:100',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'sdt' => ['nullable', 'regex:/^(0|\+84)[0-9]{9}$/'],
            'lop' => ['nullable', 'string', 'max:50'],
            'truong_hoc' => ['nullable', 'string', 'max:255'],
            'dia_chi' => ['nullable', 'string', 'max:255'],
            'ten_phu_huynh' => ['nullable', 'string', 'max:100'],
            'sdt_phu_huynh' => ['nullable', 'regex:/^(0|\+84)[0-9]{9}$/'],
            'muc_tieu_hoc_tap' => ['nullable', 'string', 'max:2000'],
            'anh_dai_dien' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ], [
            'ho_ten.required' => 'Vui lòng nhập họ và tên.',
            'ho_ten.min' => 'Họ và tên phải có ít nhất 2 ký tự.',
            'ngay_sinh.before' => 'Ngày sinh phải trước ngày hiện tại.',
            'email.required' => 'Vui lòng nhập email.',
            'email.email' => 'Email không đúng định dạng.',
            'email.unique' => 'Email này đã được sử dụng.',
            'sdt.regex' => 'Số điện thoại không đúng định dạng Việt Nam.',
            'sdt_phu_huynh.regex' => 'Số điện thoại phụ huynh không đúng định dạng Việt Nam.',
            'muc_tieu_hoc_tap.max' => 'Mục tiêu học tập không được vượt quá 2000 ký tự.',
        ]);

        $hocVien = null;
        $anhDaiDienUrl = $user->anh_dai_dien;

        if ($request->hasFile('anh_dai_dien')) {
            $thuMucAnh = public_path('images/avatar-hoc-vien');

            if (! File::isDirectory($thuMucAnh)) {
                File::makeDirectory($thuMucAnh, 0755, true);
            }

            $this->xoaAnhDaiDienCu($user->anh_dai_dien);

            $file = $request->file('anh_dai_dien');
            $tenFile = 'hoc-vien-' . $user->id . '-' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($thuMucAnh, $tenFile);
            $anhDaiDienUrl = url('images/avatar-hoc-vien/' . $tenFile);
        }

        DB::transaction(function () use ($validated, $user, &$hocVien, $anhDaiDienUrl) {
            $user->update([
                'ho_ten' => trim($validated['ho_ten']),
                'ngay_sinh' => $validated['ngay_sinh'] ?? null,
                'email' => strtolower(trim($validated['email'])),
                'sdt' => filled($validated['sdt'] ?? null) ? trim($validated['sdt']) : null,
                'anh_dai_dien' => $anhDaiDienUrl,
            ]);

            $hocVien = $user->hocvien()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'lop' => filled($validated['lop'] ?? null) ? trim($validated['lop']) : null,
                    'truong_hoc' => filled($validated['truong_hoc'] ?? null) ? trim($validated['truong_hoc']) : null,
                    'dia_chi' => filled($validated['dia_chi'] ?? null) ? trim($validated['dia_chi']) : null,
                    'ten_phu_huynh' => filled($validated['ten_phu_huynh'] ?? null) ? trim($validated['ten_phu_huynh']) : null,
                    'sdt_phu_huynh' => filled($validated['sdt_phu_huynh'] ?? null) ? trim($validated['sdt_phu_huynh']) : null,
                    'muc_tieu_hoc_tap' => filled($validated['muc_tieu_hoc_tap'] ?? null)
                        ? trim($validated['muc_tieu_hoc_tap'])
                        : null,
                ]
            );
        });

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin cá nhân thành công.',
            'data' => $this->formatHocVienProfile($user->fresh(), $hocVien ? $hocVien->fresh() : null),
        ]);
    }

    private function formatUser(User $user): array
    {
        $user->loadMissing(['hocvien', 'giasu']);

        return [
            'id' => $user->id,
            'ho_ten' => $user->ho_ten,
            'ngay_sinh' => $user->ngay_sinh ? \Carbon\Carbon::parse($user->ngay_sinh)->format('Y-m-d') : null,
            'email' => $user->email,
            'sdt' => $user->sdt,
            'dia_chi' => $user->vai_tro === 'giasu'
                ? $user->giasu?->dia_chi
                : $user->hocvien?->dia_chi,
            'vai_tro' => $user->vai_tro,
            'trang_thai' => $user->trang_thai,
            'anh_dai_dien' => $user->anh_dai_dien,
        ];
    }

    private function formatHocVienProfile(User $user, ?\App\Models\Hocvien $hocVien): array
    {
        return [
            ...$this->formatUser($user),
            'hocvien' => [
                'id' => $hocVien?->id,
                'lop' => $hocVien?->lop,
                'truong_hoc' => $hocVien?->truong_hoc,
                'dia_chi' => $hocVien?->dia_chi,
                'ten_phu_huynh' => $hocVien?->ten_phu_huynh,
                'sdt_phu_huynh' => $hocVien?->sdt_phu_huynh,
                'muc_tieu_hoc_tap' => $hocVien?->muc_tieu_hoc_tap,
            ],
        ];
    }

    private function xoaAnhDaiDienCu(?string $anhDaiDien): void
    {
        if (! $anhDaiDien) {
            return;
        }

        $duongDan = parse_url($anhDaiDien, PHP_URL_PATH) ?: $anhDaiDien;
        $duongDan = ltrim($duongDan, '/');

        if (
            ! str_starts_with($duongDan, 'images/avatar-hoc-vien/') &&
            ! str_starts_with($duongDan, 'images/avatars/')
        ) {
            return;
        }

        $file = public_path($duongDan);

        if (File::exists($file)) {
            File::delete($file);
        }
    }
}

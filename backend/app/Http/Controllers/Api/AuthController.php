<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! $this->verifyPassword($user, $credentials['password'])) {
            throw ValidationException::withMessages([
                'email' => ['Email hoặc mật khẩu không đúng.'],
            ]);
        }

        if ($user->trang_thai === 'khoa') {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.',
            ], 403);
        }

        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Đăng nhập thành công',
            'data' => [
                'user' => $this->formatUser($user),
                'token' => $token,
            ],
        ]);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'ho_ten' => ['required', 'string', 'min:3', 'max:100'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
            'vai_tro' => ['required', 'in:hoc_vien,gia_su'],
        ]);

        $vai_tro_map = [
            'hoc_vien' => 'hocvien',
            'gia_su' => 'giasu',
        ];

        $user = User::create([
            'ho_ten' => $validated['ho_ten'],
            'email' => $validated['email'],
            'password' => $validated['password'], // ⚠️ Plaintext - chỉ cho đồ án
            'vai_tro' => $vai_tro_map[$validated['vai_tro']],
            'trang_thai' => 'hoatdong',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đăng ký thành công. Vui lòng đăng nhập.',
            'data' => [
                'user' => $this->formatUser($user),
            ],
        ], 201);
    }

    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $this->formatUser($request->user()),
        ]);
    }

    public function hoSoHocVien(Request $request)
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

    public function capNhatHoSoHocVien(Request $request)
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
            'anh_dai_dien' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
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
            $thuMucAnh = public_path('images/avatars');

            if (! File::isDirectory($thuMucAnh)) {
                File::makeDirectory($thuMucAnh, 0755, true);
            }

            $this->xoaAnhDaiDienCu($user->anh_dai_dien);

            $file = $request->file('anh_dai_dien');
            $tenFile = 'hoc-vien-' . $user->id . '-' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($thuMucAnh, $tenFile);
            $anhDaiDienUrl = url('images/avatars/' . $tenFile);
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
            'data' => $this->formatHocVienProfile($user->fresh(), $hocVien->fresh()),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đăng xuất thành công',
        ]);
    }

    private function verifyPassword(User $user, string $password): bool
    {
        return $user->password === $password; // ⚠️ Plaintext - chỉ cho đồ án
    }

    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'ho_ten' => $user->ho_ten,
            'ngay_sinh' => $user->ngay_sinh?->format('Y-m-d'),
            'email' => $user->email,
            'sdt' => $user->sdt,
            'vai_tro' => $user->vai_tro,
            'trang_thai' => $user->trang_thai,
            'anh_dai_dien' => $user->anh_dai_dien,
        ];
    }

    private function xoaAnhDaiDienCu(?string $anhDaiDien): void
    {
        if (! $anhDaiDien) {
            return;
        }

        $duongDan = parse_url($anhDaiDien, PHP_URL_PATH) ?: $anhDaiDien;
        $duongDan = ltrim($duongDan, '/');

        if (! str_starts_with($duongDan, 'images/avatars/')) {
            return;
        }

        $file = public_path($duongDan);

        if (File::exists($file)) {
            File::delete($file);
        }
    }

    private function formatHocVienProfile(User $user, $hocVien): array
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
}

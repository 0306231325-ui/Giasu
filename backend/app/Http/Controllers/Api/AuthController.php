<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

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

    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $this->formatUser($request->user()),
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
        return hash_equals((string) $user->password, $password);
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
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
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
            $lyDo = trim((string) $user->ly_do_khoa);
            $noiDungLyDo = $lyDo !== '' ? " Lý do: {$lyDo}" : '';

            return response()->json([
                'success' => false,
                'code' => 'TAI_KHOAN_BI_KHOA',
                'message' => "Tài khoản của bạn đã bị khóa.{$noiDungLyDo}",
                'data' => [
                    'lyDoKhoa' => $lyDo ?: null,
                ],
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
        $user->loadMissing(['hocvien', 'giasu']);

        return [
            'id' => $user->id,
            'ho_ten' => $user->ho_ten,
            'ngay_sinh' => $user->ngay_sinh ? Carbon::parse($user->ngay_sinh)->format('Y-m-d') : null,
            'email' => $user->email,
            'sdt' => $user->sdt,
            'dia_chi' => $user->vai_tro === 'giasu'
                ? $user->giasu?->dia_chi
                : $user->hocvien?->dia_chi,
            'vai_tro' => $user->vai_tro,
            'trang_thai' => $user->trang_thai,
            'ly_do_khoa' => $user->ly_do_khoa,
            'anh_dai_dien' => $user->anh_dai_dien,
        ];
    }

}

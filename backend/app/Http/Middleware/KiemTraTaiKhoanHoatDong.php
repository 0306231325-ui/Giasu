<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class KiemTraTaiKhoanHoatDong
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user?->trang_thai === 'khoa') {
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

        return $next($request);
    }
}

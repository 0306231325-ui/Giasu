<?php

namespace App\Services;

use App\Models\NhatKyHeThong;
use App\Models\User;

class NhatKyHeThongService
{
    public static function ghi(
        ?User $user,
        string $hanhDong,
        ?int $doiTuongId,
        string $noiDung,
        ?string $vaiTro = null
    ): void {
        NhatKyHeThong::create([
            'user_id' => $user?->id,
            'hanh_dong' => $hanhDong,
            'vai_tro' => $vaiTro ?? $user?->vai_tro,
            'doi_tuong_id' => $doiTuongId,
            'noi_dung' => $noiDung,
            'created_at' => now(),
        ]);
    }
}

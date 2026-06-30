<?php

namespace App\Services;

use App\Models\Giasu;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class GiaSuFileService
{
    public function luuAvatarGiaSu(Giasu $giaSu, UploadedFile $file): array
    {
        $thuMucAnh = public_path('images/avatar-gia-su');

        if (! File::isDirectory($thuMucAnh)) {
            File::makeDirectory($thuMucAnh, 0755, true);
        }

        $tenFile = 'gia-su-' . $giaSu->id . '-' . time() . '-' . bin2hex(random_bytes(4))
            . '.' . $file->getClientOriginalExtension();
        $duongDanMoi = 'images/avatar-gia-su/' . $tenFile;

        $file->move($thuMucAnh, $tenFile);

        return [
            'duong_dan' => $duongDanMoi,
            'url' => url($duongDanMoi),
        ];
    }

    public function xoaAvatarGiaSuCu(?string $avatar): void
    {
        if (! $avatar) {
            return;
        }

        $duongDan = ltrim(parse_url($avatar, PHP_URL_PATH) ?: $avatar, '/');

        if (! str_starts_with($duongDan, 'images/avatar-gia-su/')) {
            return;
        }

        $file = public_path($duongDan);

        if (File::exists($file)) {
            File::delete($file);
        }
    }

    public function xoaAvatarTheoDuongDan(?string $duongDan): void
    {
        if ($duongDan) {
            File::delete(public_path($duongDan));
        }
    }

    public function luuFileBangCap(Giasu $giaSu, UploadedFile $file): ?string
    {
        return $file->store("giasu/{$giaSu->id}/bang-cap", 'local') ?: null;
    }

    public function fileBangCapTonTai(?string $duongDan): bool
    {
        return filled($duongDan) && Storage::disk('local')->exists($duongDan);
    }

    public function duongDanFileBangCap(string $duongDan): string
    {
        return Storage::disk('local')->path($duongDan);
    }

    public function xoaFileBangCap(?string $duongDan): void
    {
        if ($duongDan) {
            Storage::disk('local')->delete($duongDan);
        }
    }
}

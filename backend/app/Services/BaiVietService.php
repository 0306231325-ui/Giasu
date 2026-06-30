<?php

namespace App\Services;

use App\Models\BaiViet;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class BaiVietService
{
    public function taoSlugKhongTrung(string $tieuDe, ?int $boQuaBaiVietId = null): string
    {
        $slugGoc = Str::slug($tieuDe);
        $slugGoc = $slugGoc !== '' ? $slugGoc : 'bai-viet';
        $slug = $slugGoc;
        $dem = 2;

        while (
            BaiViet::where('slug', $slug)
                ->when($boQuaBaiVietId, function ($query) use ($boQuaBaiVietId) {
                    $query->where('id', '!=', $boQuaBaiVietId);
                })
                ->exists()
        ) {
            $slug = $slugGoc . '-' . $dem;
            $dem++;
        }

        return $slug;
    }

    public function luuAnhBia(UploadedFile $file, string $slug): string
    {
        $thuMucAnh = public_path('images/baiviet');

        if (! File::isDirectory($thuMucAnh)) {
            File::makeDirectory($thuMucAnh, 0755, true);
        }

        $tenFile = $slug . '-' . time() . '.' . $file->getClientOriginalExtension();
        $file->move($thuMucAnh, $tenFile);

        return url('images/baiviet/' . $tenFile);
    }

    public function xoaAnhBaiVietCu(?string $anhBia): void
    {
        if (! $anhBia) {
            return;
        }

        $duongDan = parse_url($anhBia, PHP_URL_PATH) ?: $anhBia;
        $prefix = '/images/baiviet/';

        if (! str_starts_with($duongDan, $prefix)) {
            return;
        }

        $tenFile = basename($duongDan);

        if ($tenFile === '' || $tenFile === '.gitkeep') {
            return;
        }

        $duongDanFile = public_path('images/baiviet/' . $tenFile);

        if (File::exists($duongDanFile)) {
            File::delete($duongDanFile);
        }
    }
}

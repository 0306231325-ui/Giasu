<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\GiasuBangCap;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class AdminGiaSuBangCapController extends Controller
{
    public function xemBangCapAdmin(Request $request, int $bangCapId)
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền truy cập.',
            ], 403);
        }

        $bangCap = GiasuBangCap::query()->find($bangCapId);

        if (! $bangCap) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy tài liệu.',
            ], 404);
        }

        if (! $this->fileTonTai($bangCap->file_url)) {
            return response()->json([
                'success' => false,
                'message' => 'File tài liệu không còn tồn tại.',
            ], 404);
        }

        return response()->file(
            $this->duongDanFile($bangCap->file_url),
            ['Content-Disposition' => 'inline'],
        );
    }

    private function fileTonTai(?string $duongDan): bool
    {
        if (! filled($duongDan)) {
            return false;
        }

        return File::exists(public_path($this->layDuongDanTuongDoi($duongDan)));
    }

    private function duongDanFile(string $duongDan): string
    {
        return public_path($this->layDuongDanTuongDoi($duongDan));
    }

    private function layDuongDanTuongDoi(string $duongDan): string
    {
        return ltrim(parse_url($duongDan, PHP_URL_PATH) ?: $duongDan, '/');
    }
}

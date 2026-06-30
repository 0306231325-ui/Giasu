<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\GiasuBangCap;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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

        if (! Storage::disk('local')->exists($bangCap->file_url)) {
            return response()->json([
                'success' => false,
                'message' => 'File tài liệu không còn tồn tại.',
            ], 404);
        }

        return response()->file(
            Storage::disk('local')->path($bangCap->file_url),
            ['Content-Disposition' => 'inline'],
        );
    }
}

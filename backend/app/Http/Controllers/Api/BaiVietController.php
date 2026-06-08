<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BaiViet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class BaiVietController extends Controller
{
    private const SO_BAI_VIET_MOI_TRANG = 10;

    public function baiVietMoi()
    {
        $baiviet = BaiViet::where('trang_thai', 'xuat_ban')
            ->latest()
            ->take(4)
            ->get();

        return response()->json($baiviet);
    }

    public function danhSachBaiVietAdmin(Request $request)
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền truy cập.',
            ], 403);
        }

        $keyword = trim((string) $request->query('q', ''));
        $trangThai = $request->query('trang_thai');

        $baiViet = BaiViet::query()
            ->when($keyword !== '', function ($query) use ($keyword) {
                $query->where(function ($subQuery) use ($keyword) {
                    $subQuery
                        ->where('tieu_de', 'like', "%{$keyword}%")
                        ->orWhere('tom_tat', 'like', "%{$keyword}%")
                        ->orWhere('slug', 'like', "%{$keyword}%");
                });
            })
            ->when(in_array($trangThai, ['xuat_ban', 'nhap', 'an'], true), function ($query) use ($trangThai) {
                $query->where('trang_thai', $trangThai);
            })
            ->orderByDesc('id')
            ->paginate(self::SO_BAI_VIET_MOI_TRANG)
            ->withQueryString();

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách bài viết thành công.',
            'data' => $baiViet,
        ]);
    }

    public function chiTiet($slug)
    {
        $baiviet = BaiViet::where('slug', $slug)->firstOrFail();

        $baiviet->increment('luot_xem');

        return response()->json($baiviet);
    }

    public function taoBaiVietAdmin(Request $request)
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền truy cập.',
            ], 403);
        }

        $duLieu = $request->validate([
            'tieu_de' => ['required', 'string', 'max:255'],
            'tom_tat' => ['nullable', 'string'],
            'noi_dung' => ['required', 'string'],
            'trang_thai' => ['required', 'in:xuat_ban,nhap,an'],
            'anh_bia' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $slug = $this->taoSlugKhongTrung($duLieu['tieu_de']);
        $anhBiaUrl = null;

        if ($request->hasFile('anh_bia')) {
            $thuMucAnh = public_path('images/baiviet');

            if (! File::isDirectory($thuMucAnh)) {
                File::makeDirectory($thuMucAnh, 0755, true);
            }

            $file = $request->file('anh_bia');
            $tenFile = $slug . '-' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($thuMucAnh, $tenFile);
            $anhBiaUrl = url('images/baiviet/' . $tenFile);
        }

        $baiViet = BaiViet::create([
            'user_id' => $request->user()->id,
            'tieu_de' => $duLieu['tieu_de'],
            'slug' => $slug,
            'tom_tat' => $duLieu['tom_tat'] ?? null,
            'noi_dung' => $duLieu['noi_dung'],
            'anh_bia' => $anhBiaUrl,
            'trang_thai' => $duLieu['trang_thai'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tạo bài viết thành công.',
            'data' => $baiViet,
        ], 201);
    }

    private function taoSlugKhongTrung(string $tieuDe): string
    {
        $slugGoc = Str::slug($tieuDe);
        $slugGoc = $slugGoc !== '' ? $slugGoc : 'bai-viet';
        $slug = $slugGoc;
        $dem = 2;

        while (BaiViet::where('slug', $slug)->exists()) {
            $slug = $slugGoc . '-' . $dem;
            $dem++;
        }

        return $slug;
    }
}

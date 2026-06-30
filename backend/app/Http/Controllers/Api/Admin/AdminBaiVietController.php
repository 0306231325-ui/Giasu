<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BaiViet;
use App\Services\BaiVietService;
use Illuminate\Http\Request;

class AdminBaiVietController extends Controller
{
    private const SO_BAI_VIET_MOI_TRANG = 5;
    private const DUNG_LUONG_ANH_BIA_TOI_DA_KB = 2048;

    public function __construct(private readonly BaiVietService $baiVietService)
    {
    }

    private function quyTacValidateBaiViet(): array
    {
        return [
            'tieu_de' => ['required', 'string', 'max:255'],
            'tom_tat' => ['nullable', 'string'],
            'noi_dung' => ['required', 'string'],
            'trang_thai' => ['required', 'in:xuat_ban,nhap,an'],
            'anh_bia' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:' . self::DUNG_LUONG_ANH_BIA_TOI_DA_KB,
            ],
        ];
    }

    private function thongBaoValidateBaiViet(): array
    {
        return [
            'anh_bia.uploaded' => 'Ảnh bìa tải lên thất bại. Vui lòng chọn ảnh JPG, PNG hoặc WebP dưới 2MB.',
            'anh_bia.image' => 'Ảnh bìa phải là một file ảnh hợp lệ.',
            'anh_bia.mimes' => 'Ảnh bìa chỉ hỗ trợ định dạng JPG, PNG hoặc WebP.',
            'anh_bia.max' => 'Ảnh bìa không được lớn hơn 2MB.',
        ];
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

    public function thungRacBaiVietAdmin(Request $request)
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền truy cập.',
            ], 403);
        }

        $keyword = trim((string) $request->query('q', ''));

        $baiViet = BaiViet::onlyTrashed()
            ->with('nguoiXoa:id,ho_ten,email')
            ->when($keyword !== '', function ($query) use ($keyword) {
                $query->where(function ($subQuery) use ($keyword) {
                    $subQuery
                        ->where('tieu_de', 'like', "%{$keyword}%")
                        ->orWhere('tom_tat', 'like', "%{$keyword}%")
                        ->orWhere('slug', 'like', "%{$keyword}%");
                });
            })
            ->orderByDesc('deleted_at')
            ->paginate(self::SO_BAI_VIET_MOI_TRANG)
            ->withQueryString();

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách bài viết đã xóa thành công.',
            'data' => $baiViet,
        ]);
    }

    public function taoBaiVietAdmin(Request $request)
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền truy cập.',
            ], 403);
        }

        $duLieu = $request->validate(
            $this->quyTacValidateBaiViet(),
            $this->thongBaoValidateBaiViet(),
        );

        $slug = $this->baiVietService->taoSlugKhongTrung($duLieu['tieu_de']);
        $anhBiaUrl = null;

        if ($request->hasFile('anh_bia')) {
            $anhBiaUrl = $this->baiVietService->luuAnhBia(
                $request->file('anh_bia'),
                $slug,
            );
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

    public function capNhatBaiVietAdmin(Request $request, int $baiVietId)
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền truy cập.',
            ], 403);
        }

        $baiViet = BaiViet::find($baiVietId);

        if (! $baiViet) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy bài viết.',
            ], 404);
        }

        $duLieu = $request->validate(
            $this->quyTacValidateBaiViet(),
            $this->thongBaoValidateBaiViet(),
        );

        $anhBiaUrl = $baiViet->anh_bia;
        $slugMoi = $this->baiVietService->taoSlugKhongTrung($duLieu['tieu_de'], $baiViet->id);

        if ($request->hasFile('anh_bia')) {
            $this->baiVietService->xoaAnhBaiVietCu($baiViet->anh_bia);

            $anhBiaUrl = $this->baiVietService->luuAnhBia(
                $request->file('anh_bia'),
                $slugMoi,
            );
        }

        $baiViet->fill([
            'tieu_de' => $duLieu['tieu_de'],
            'slug' => $slugMoi,
            'tom_tat' => $duLieu['tom_tat'] ?? null,
            'noi_dung' => $duLieu['noi_dung'],
            'anh_bia' => $anhBiaUrl,
            'trang_thai' => $duLieu['trang_thai'],
        ]);
        $baiViet->save();

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật bài viết thành công.',
            'data' => $baiViet,
        ]);
    }

    public function xoaBaiVietAdmin(Request $request, int $baiVietId)
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền truy cập.',
            ], 403);
        }

        $baiViet = BaiViet::find($baiVietId);

        if (! $baiViet) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy bài viết.',
            ], 404);
        }

        $baiViet->deleted_by_id = $request->user()->id;
        $baiViet->save();
        $baiViet->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã đưa bài viết vào thùng rác.',
        ]);
    }

    public function khoiPhucBaiVietAdmin(Request $request, int $baiVietId)
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền truy cập.',
            ], 403);
        }

        $baiViet = BaiViet::onlyTrashed()->find($baiVietId);

        if (! $baiViet) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy bài viết trong thùng rác.',
            ], 404);
        }

        $baiViet->restore();
        $baiViet->deleted_by_id = null;
        $baiViet->save();

        return response()->json([
            'success' => true,
            'message' => 'Khôi phục bài viết thành công.',
            'data' => $baiViet,
        ]);
    }

    public function xoaVinhVienBaiVietAdmin(Request $request, int $baiVietId)
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền truy cập.',
            ], 403);
        }

        $baiViet = BaiViet::onlyTrashed()->find($baiVietId);

        if (! $baiViet) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy bài viết trong thùng rác.',
            ], 404);
        }

        $this->baiVietService->xoaAnhBaiVietCu($baiViet->anh_bia);
        $baiViet->forceDelete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa vĩnh viễn bài viết.',
        ]);
    }

}

<?php

namespace App\Http\Controllers\Api\GiaSu;

use App\Http\Controllers\Controller;
use App\Services\GiaSuFileService;
use App\Services\GiaSuHoSoService;
use App\Services\NhatKyHeThongService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class GiaSuHoSoController extends Controller
{
    public function __construct(
        private readonly GiaSuHoSoService $giaSuHoSoService,
        private readonly GiaSuFileService $giaSuFileService,
    ) {
    }

    public function hoSoCaNhan(Request $request): JsonResponse
    {
        $user = $request->user();
        $giaSu = $this->giaSuHoSoService->layHoSoGiaSu($user);

        if (! $giaSu) {
            return $this->phanHoiKhongCoHoSo($request);
        }

        return response()->json([
            'success' => true,
            'data' => $this->giaSuHoSoService->dinhDangThongTinCaNhan($user, $giaSu),
        ]);
    }

    public function capNhatHoSoCaNhan(Request $request): JsonResponse
    {
        $user = $request->user();
        $giaSu = $this->giaSuHoSoService->layHoSoGiaSu($user);

        if (! $giaSu) {
            return $this->phanHoiKhongCoHoSo($request);
        }

        $duLieu = $request->validate([
            'ho_ten' => ['required', 'string', 'min:2', 'max:100'],
            'ngay_sinh' => ['required', 'date', 'before:today'],
            'sdt' => ['required', 'regex:/^(0|\+84)[0-9]{9}$/'],
            'email' => [
                'required',
                'email',
                'max:100',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'dia_chi' => ['required', 'string', 'min:5', 'max:255'],
            'mo_ta' => ['nullable', 'string', 'max:2000'],
        ], [
            'ho_ten.required' => 'Vui lòng nhập họ và tên.',
            'ho_ten.min' => 'Họ và tên phải có ít nhất 2 ký tự.',
            'ngay_sinh.required' => 'Vui lòng chọn ngày sinh.',
            'ngay_sinh.before' => 'Ngày sinh phải trước ngày hiện tại.',
            'sdt.required' => 'Vui lòng nhập số điện thoại.',
            'sdt.regex' => 'Số điện thoại không đúng định dạng Việt Nam.',
            'email.required' => 'Vui lòng nhập email.',
            'email.email' => 'Email không đúng định dạng.',
            'email.unique' => 'Email này đã được sử dụng.',
            'dia_chi.required' => 'Vui lòng nhập địa chỉ hiện tại.',
            'dia_chi.min' => 'Địa chỉ phải có ít nhất 5 ký tự.',
            'mo_ta.max' => 'Giới thiệu bản thân không được vượt quá 2000 ký tự.',
        ]);

        $duLieuCu = [
            'ho_ten'   => $user->ho_ten,
            'ngay_sinh' => $user->ngay_sinh,
            'sdt'      => $user->sdt,
            'email'    => $user->email,
            'dia_chi'  => $giaSu->dia_chi,
            'mo_ta'    => $giaSu->mo_ta,
        ];

        DB::transaction(function () use ($duLieu, $user, $giaSu) {
            $user->update([
                'ho_ten'    => trim($duLieu['ho_ten']),
                'ngay_sinh' => $duLieu['ngay_sinh'],
                'sdt'       => $duLieu['sdt'],
                'email'     => strtolower(trim($duLieu['email'])),
            ]);

            $giaSu->update([
                'dia_chi' => trim($duLieu['dia_chi']),
                'mo_ta'   => filled($duLieu['mo_ta'] ?? null)
                    ? trim($duLieu['mo_ta'])
                    : null,
            ]);
        });

        $duLieuMoi = [
            'ho_ten'    => trim($duLieu['ho_ten']),
            'ngay_sinh' => $duLieu['ngay_sinh'],
            'sdt'       => $duLieu['sdt'],
            'email'     => strtolower(trim($duLieu['email'])),
            'dia_chi'   => trim($duLieu['dia_chi']),
            'mo_ta'     => filled($duLieu['mo_ta'] ?? null) ? trim($duLieu['mo_ta']) : null,
        ];

        $nhanTruong = [
            'ho_ten'    => 'Họ tên',
            'ngay_sinh' => 'Ngày sinh',
            'sdt'       => 'Số điện thoại',
            'email'     => 'Email',
            'dia_chi'   => 'Địa chỉ',
            'mo_ta'     => 'Giới thiệu',
        ];

        $danhSachThayDoi = [];
        foreach ($nhanTruong as $truong => $nhan) {
            $cu  = (string) ($duLieuCu[$truong] ?? '');
            $moi = (string) ($duLieuMoi[$truong] ?? '');
            if ($cu !== $moi) {
                $danhSachThayDoi[] = $nhan;
            }
        }

        $noiDungLog = empty($danhSachThayDoi)
            ? ($user->ho_ten . ' cập nhật thông tin cá nhân (không có thay đổi).')
            : ($user->fresh()->ho_ten . ' cập nhật thông tin cá nhân: ' . implode(', ', $danhSachThayDoi) . '.');

        NhatKyHeThongService::ghi(
            $user,
            'cap_nhat_thong_tin_ca_nhan',
            $giaSu->id,
            $noiDungLog,
        );

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin cá nhân thành công.',
            'data'    => $this->giaSuHoSoService->dinhDangThongTinCaNhan($user->fresh(), $giaSu->fresh()),
        ]);
    }

    public function capNhatAvatar(Request $request): JsonResponse
    {
        $giaSu = $this->giaSuHoSoService->layHoSoGiaSu($request->user());

        if (! $giaSu) {
            return $this->phanHoiKhongCoHoSo($request);
        }

        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ], [
            'avatar.required' => 'Vui lòng chọn ảnh đại diện.',
            'avatar.image' => 'File tải lên phải là hình ảnh.',
            'avatar.mimes' => 'Ảnh đại diện chỉ hỗ trợ JPG, JPEG, PNG hoặc WEBP.',
            'avatar.max' => 'Ảnh đại diện không được vượt quá 5MB.',
        ]);

        $duongDanCu = $giaSu->avatar;
        $anhMoi = $this->giaSuFileService->luuAvatarGiaSu($giaSu, $request->file('avatar'));

        try {
            DB::transaction(function () use ($giaSu, $anhMoi) {
                $giaSu->update(['avatar' => $anhMoi['duong_dan']]);
                $giaSu->user()->update([
                    'anh_dai_dien' => $anhMoi['url'],
                ]);
            });
        } catch (\Throwable $loi) {
            $this->giaSuFileService->xoaAvatarTheoDuongDan($anhMoi['duong_dan']);
            throw $loi;
        }

        $this->giaSuFileService->xoaAvatarGiaSuCu($duongDanCu);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật ảnh đại diện thành công.',
            'data' => [
                'avatar' => $anhMoi['duong_dan'],
                'avatar_url' => $anhMoi['url'],
            ],
        ]);
    }

    private function phanHoiKhongCoHoSo(Request $request): JsonResponse
    {
        $laGiaSu = $request->user()?->vai_tro === 'giasu';

        return response()->json([
            'success' => false,
            'message' => $laGiaSu
                ? 'Không tìm thấy hồ sơ gia sư.'
                : 'Chỉ tài khoản gia sư mới có thể quản lý hồ sơ.',
        ], $laGiaSu ? 404 : 403);
    }
}

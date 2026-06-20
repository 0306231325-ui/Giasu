<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DanhGia;
use App\Models\Giasu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class GiasuController extends Controller
{
    public function index()
    {
        try {

            $danhSachGiaSu = Giasu::with([
                                        'user:id,ho_ten,anh_dai_dien,sdt',
                                    ])
                                    ->withCount([
                                        'lichHocs as danh_gias_count' => function ($query) {
                                            $query->whereHas('danhGia');
                                        },
                                    ])
                                    ->withMin('giasuGias as gia_tu', 'tong_gia')
                                    ->withMax('giasuGias as gia_den', 'tong_gia')
                                    ->addSelect([
                                        'danh_gias_avg_so_sao' => DanhGia::selectRaw('coalesce(avg(danhgia.so_sao), 0)')
                                            ->join('lichhoc', 'lichhoc.id', '=', 'danhgia.lichhoc_id')
                                            ->join('goihoc', 'goihoc.id', '=', 'lichhoc.goihoc_id')
                                            ->whereColumn('goihoc.giasu_id', 'giasu.id')
                                            ->limit(1),
                                    ])
                                    ->orderBy('id', 'desc')
                                    ->paginate(12);

            return response()->json([
                'success' => true,
                'message' => 'Lấy danh sách gia sư thành công',
                'data' => $danhSachGiaSu
            ], 200);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage()
            ], 500);

        }
    }

    public function hoSoCaNhan(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->vai_tro !== 'giasu') {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ tài khoản gia sư mới có thể truy cập hồ sơ này.',
            ], 403);
        }

        $giaSu = $user->giasu()->first();

        if (! $giaSu) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy hồ sơ gia sư.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->dinhDangThongTinCaNhan($user, $giaSu),
        ]);
    }

    public function capNhatHoSoCaNhan(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->vai_tro !== 'giasu') {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ tài khoản gia sư mới có thể cập nhật hồ sơ này.',
            ], 403);
        }

        $giaSu = $user->giasu()->first();

        if (! $giaSu) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy hồ sơ gia sư.',
            ], 404);
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

        DB::transaction(function () use ($duLieu, $user, $giaSu) {
            $user->update([
                'ho_ten' => trim($duLieu['ho_ten']),
                'ngay_sinh' => $duLieu['ngay_sinh'],
                'sdt' => $duLieu['sdt'],
                'email' => strtolower(trim($duLieu['email'])),
            ]);

            $giaSu->update([
                'dia_chi' => trim($duLieu['dia_chi']),
                'mo_ta' => filled($duLieu['mo_ta'] ?? null)
                    ? trim($duLieu['mo_ta'])
                    : null,
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin cá nhân thành công.',
            'data' => $this->dinhDangThongTinCaNhan($user->fresh(), $giaSu->fresh()),
        ]);
    }

    private function dinhDangThongTinCaNhan($user, Giasu $giaSu): array
    {
        return [
            'ho_ten' => $user->ho_ten,
            'ngay_sinh' => $user->ngay_sinh?->format('Y-m-d'),
            'sdt' => $user->sdt,
            'email' => $user->email,
            'dia_chi' => $giaSu->dia_chi,
            'mo_ta' => $giaSu->mo_ta,
        ];
    }
}

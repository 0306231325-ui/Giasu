<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Giasu;
use App\Models\GiasuBangCap;
use App\Models\GiasuGia;
use App\Models\ThongBao;
use App\Services\AdminXetDuyetGiaSuService;
use App\Services\GiaTinhService;
use App\Services\NhatKyHeThongService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AdminYeuCauChuyenMonController extends Controller
{
    public function __construct(
        private readonly AdminXetDuyetGiaSuService $adminXetDuyetGiaSuService,
    ) {
    }

    public function danhSach(Request $request): JsonResponse
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền truy cập.',
            ], 403);
        }

        $trangThai = $request->query('trang_thai', 'cho_duyet');
        $loai = $request->query('loai', 'tat_ca');
        $tuKhoa = trim((string) $request->query('q', ''));

        if (! in_array($trangThai, ['cho_duyet', 'da_duyet', 'tu_choi'], true)) {
            $trangThai = 'cho_duyet';
        }

        if (! in_array($loai, ['tat_ca', 'bang_cap', 'mon_day'], true)) {
            $loai = 'tat_ca';
        }

        $tatCaYeuCau = $this->gomYeuCauChuyenMon();

        $danhSach = $tatCaYeuCau
            ->filter(fn (array $yeuCau) => $yeuCau['trangThai'] === $trangThai)
            ->filter(fn (array $yeuCau) => $loai === 'tat_ca' || $yeuCau['loai'] === $loai)
            ->filter(function (array $yeuCau) use ($tuKhoa) {
                if ($tuKhoa === '') {
                    return true;
                }

                $noiDungTim = strtolower(implode(' ', [
                    $yeuCau['ma'],
                    $yeuCau['giaSu'],
                    $yeuCau['email'],
                    $yeuCau['tieuDe'],
                ]));

                return str_contains($noiDungTim, strtolower($tuKhoa));
            })
            ->values();

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách yêu cầu chuyên môn thành công.',
            'data' => [
                'yeuCau' => $danhSach,
                'thongKe' => [
                    'choDuyet' => $tatCaYeuCau->where('trangThai', 'cho_duyet')->count(),
                    'daDuyet' => $tatCaYeuCau->where('trangThai', 'da_duyet')->count(),
                    'tuChoi' => $tatCaYeuCau->where('trangThai', 'tu_choi')->count(),
                ],
            ],
        ]);
    }

    public function xuLy(Request $request, string $loai, int $id): JsonResponse
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền truy cập.',
            ], 403);
        }

        if (! in_array($loai, ['bang_cap', 'mon_day'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Loại yêu cầu không hợp lệ.',
            ], 422);
        }

        $duLieu = $request->validate([
            'hanh_dong' => ['required', 'in:duyet,tu_choi'],
            'ly_do' => ['required_if:hanh_dong,tu_choi', 'nullable', 'string', 'min:5', 'max:1000'],
        ], [
            'hanh_dong.required' => 'Vui lòng chọn thao tác xử lý.',
            'hanh_dong.in' => 'Thao tác xử lý không hợp lệ.',
            'ly_do.required_if' => 'Vui lòng nhập lý do từ chối.',
            'ly_do.min' => 'Lý do từ chối phải có ít nhất 5 ký tự.',
        ]);

        if ($loai === 'bang_cap') {
            return $this->xuLyBangCap($request, $id, $duLieu);
        }

        return $this->xuLyMonDay($request, $id, $duLieu);
    }

    private function gomYeuCauChuyenMon(): Collection
    {
        $bangCap = GiasuBangCap::query()
            ->with(['giasu.user:id,ho_ten,email', 'trinhDo:id,ten,thu_tu'])
            ->whereHas('giasu', function ($query) {
                $query->where('trang_thai_ho_so', 'duyet');
            })
            ->latest()
            ->get()
            ->map(fn (GiasuBangCap $bangCap) => $this->dinhDangBangCap($bangCap));

        $monDay = GiasuGia::query()
            ->with([
                'giasu.user:id,ho_ten,email',
                'giasu.bangCaps.trinhDo:id,ten,thu_tu',
                'monHoc.capHoc:id,ten',
            ])
            ->whereHas('giasu', function ($query) {
                $query->where('trang_thai_ho_so', 'duyet');
            })
            ->where('trang_thai', '!=', GiasuGia::TRANG_THAI_NGUNG_DAY)
            ->latest()
            ->get()
            ->groupBy(function (GiasuGia $mucGia) {
                return implode('-', [
                    $mucGia->giasu_id,
                    $mucGia->monHoc?->cap_hoc_id ?? 'cap',
                    $mucGia->monHoc?->ten_mon ?? 'mon',
                    $mucGia->trang_thai,
                ]);
            })
            ->map(fn (Collection $nhom) => $this->dinhDangMonDay($nhom))
            ->values();

        return $bangCap
            ->concat($monDay)
            ->sortByDesc('thoiGianSapXep')
            ->values();
    }

    private function dinhDangBangCap(GiasuBangCap $bangCap): array
    {
        $trangThai = $this->quyDoiTrangThaiBangCap($bangCap->trang_thai);

        return [
            'id' => $bangCap->id,
            'ma' => 'BC' . str_pad((string) $bangCap->id, 6, '0', STR_PAD_LEFT),
            'loai' => 'bang_cap',
            'loaiText' => 'Bằng cấp/chứng chỉ',
            'trangThai' => $trangThai,
            'giaSu' => $bangCap->giasu?->user?->ho_ten ?? 'Chưa cập nhật',
            'email' => $bangCap->giasu?->user?->email ?? 'Chưa cập nhật',
            'ngayGui' => optional($bangCap->created_at)->timezone('Asia/Ho_Chi_Minh')->format('d/m/Y H:i'),
            'thoiGianSapXep' => optional($bangCap->created_at)->timestamp ?? 0,
            'tieuDe' => $bangCap->ten_bang,
            'moTa' => 'Gia sư gửi tài liệu chuyên môn để quản trị viên xét duyệt.',
            'lyDo' => $bangCap->ly_do,
            'urlXem' => $bangCap->file_url ? "/admin/gia-su/bang-cap/{$bangCap->id}/xem" : null,
            'thongTin' => [
                ['Loại tài liệu', $this->tenLoaiBang($bangCap->loai_bang)],
                ['Trình độ xác minh', $bangCap->trinhDo?->ten ?? 'Chưa cập nhật'],
                ['Chuyên ngành', $bangCap->chuyen_nganh ?: 'Chưa cập nhật'],
                ['Trường/đơn vị cấp', $bangCap->truong_don_vi ?: 'Chưa cập nhật'],
                ['File minh chứng', basename((string) $bangCap->file_url) ?: 'Chưa có file'],
            ],
            'anhHuong' => $trangThai === 'cho_duyet'
                ? [
                    'Nếu được duyệt, hệ thống sẽ tính lại trình độ cao nhất của gia sư.',
                    'Các môn đã duyệt có thể được cập nhật lại theo phụ cấp trình độ mới.',
                ]
                : ['Yêu cầu này đã được xử lý.'],
        ];
    }

    private function dinhDangMonDay(Collection $nhom): array
    {
        /** @var GiasuGia $mucGia */
        $mucGia = $nhom->sortBy('id')->first();
        $monHoc = $mucGia->monHoc;
        $giaCoBan = (float) $mucGia->gia_mon
            + (float) $mucGia->gia_cong_trinh_do
            + (float) $mucGia->gia_cong_kinh_nghiem;

        return [
            'id' => $mucGia->id,
            'ma' => 'MD' . str_pad((string) $mucGia->id, 6, '0', STR_PAD_LEFT),
            'loai' => 'mon_day',
            'loaiText' => 'Môn dạy & giá',
            'trangThai' => $this->quyDoiTrangThaiMonDay($mucGia->trang_thai),
            'giaSu' => $mucGia->giasu?->user?->ho_ten ?? 'Chưa cập nhật',
            'email' => $mucGia->giasu?->user?->email ?? 'Chưa cập nhật',
            'ngayGui' => optional($mucGia->created_at)->timezone('Asia/Ho_Chi_Minh')->format('d/m/Y H:i'),
            'thoiGianSapXep' => optional($mucGia->created_at)->timestamp ?? 0,
            'tieuDe' => 'Đăng ký dạy ' . ($monHoc?->ten_mon ?? 'môn học'),
            'moTa' => 'Gia sư gửi yêu cầu bổ sung môn dạy trong danh mục giảng dạy.',
            'lyDo' => $mucGia->ly_do_tu_choi,
            'thongTin' => [
                ['Môn học', $monHoc?->ten_mon ?? 'Chưa cập nhật'],
                ['Cấp học', $monHoc?->capHoc?->ten ?? 'Chưa cập nhật'],
                ['Giá môn', $this->dinhDangTien($mucGia->gia_mon)],
                ['Phụ cấp trình độ', $this->dinhDangTien($mucGia->gia_cong_trinh_do)],
                ['Phụ cấp kinh nghiệm', $this->dinhDangTien($mucGia->gia_cong_kinh_nghiem)],
                ['Giá cơ bản', $this->dinhDangTien($giaCoBan)],
                ['Giá cộng thêm', $this->dinhDangTien($mucGia->gia_cong_them)],
                ['Tổng giá', $this->dinhDangTien($mucGia->tong_gia) . '/giờ'],
            ],
            'bangCapGiaSu' => $this->dinhDangBangCapCuaGiaSu($mucGia->giasu),
            'anhHuong' => [
                'Nếu được duyệt, môn này sẽ hiển thị trong danh mục môn dạy của gia sư.',
                'Học viên chỉ đặt được môn này sau khi trạng thái chuyển sang đã duyệt.',
            ],
        ];
    }

    private function dinhDangBangCapCuaGiaSu(?Giasu $giaSu): array
    {
        if (! $giaSu) {
            return [];
        }

        return $giaSu->bangCaps
            ->sortByDesc(fn (GiasuBangCap $bangCap) => optional($bangCap->created_at)->timestamp ?? 0)
            ->map(fn (GiasuBangCap $bangCap) => [
                'id' => $bangCap->id,
                'ten' => $bangCap->ten_bang,
                'loai' => $this->tenLoaiBang($bangCap->loai_bang),
                'trinhDo' => $bangCap->trinhDo?->ten ?? 'Chưa cập nhật',
                'chuyenNganh' => $bangCap->chuyen_nganh ?: 'Chưa cập nhật',
                'donVi' => $bangCap->truong_don_vi ?: 'Chưa cập nhật',
                'trangThai' => $this->quyDoiTrangThaiBangCap($bangCap->trang_thai),
                'lyDo' => $bangCap->ly_do,
                'urlXem' => $bangCap->file_url ? "/admin/gia-su/bang-cap/{$bangCap->id}/xem" : null,
            ])
            ->values()
            ->all();
    }

    private function xuLyBangCap(Request $request, int $id, array $duLieu): JsonResponse
    {
        $bangCap = GiasuBangCap::query()
            ->where('trang_thai', 'cho_duyet')
            ->with('giasu.user')
            ->find($id);

        if (! $bangCap || ! $bangCap->giasu) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy yêu cầu bằng cấp chờ duyệt.',
            ], 404);
        }

        DB::transaction(function () use ($request, $bangCap, $duLieu) {
            if ($duLieu['hanh_dong'] === 'duyet') {
                $bangCap->update([
                    'trang_thai' => 'duyet',
                    'duyet_boi' => $request->user()->id,
                    'duyet_luc' => now(),
                    'ly_do' => null,
                ]);

                $this->capNhatTrinhDoVaGia($bangCap->giasu);
                $this->taoThongBao($bangCap->giasu, 'Yêu cầu bằng cấp đã được duyệt', 'Tài liệu chuyên môn của bạn đã được quản trị viên duyệt.');

                return;
            }

            $lyDo = trim((string) $duLieu['ly_do']);
            $bangCap->update([
                'trang_thai' => 'tu_choi',
                'duyet_boi' => $request->user()->id,
                'duyet_luc' => now(),
                'ly_do' => $lyDo,
            ]);

            $this->taoThongBao($bangCap->giasu, 'Yêu cầu bằng cấp bị từ chối', "Tài liệu chuyên môn của bạn bị từ chối. Lý do: {$lyDo}");
        });

        NhatKyHeThongService::ghi(
            $request->user(),
            $duLieu['hanh_dong'] === 'duyet' ? 'duyet_yeu_cau_chuyen_mon' : 'tu_choi_yeu_cau_chuyen_mon',
            $bangCap->id,
            $duLieu['hanh_dong'] === 'duyet'
                ? "Admin duyệt yêu cầu bằng cấp/chứng chỉ {$bangCap->ten_bang_cap} của gia sư {$bangCap->giasu?->user?->ho_ten}."
                : "Admin từ chối yêu cầu bằng cấp/chứng chỉ {$bangCap->ten_bang_cap} của gia sư {$bangCap->giasu?->user?->ho_ten}. Lý do: " . trim((string) $duLieu['ly_do'])
        );

        return response()->json([
            'success' => true,
            'message' => $duLieu['hanh_dong'] === 'duyet'
                ? 'Đã duyệt yêu cầu bằng cấp.'
                : 'Đã từ chối yêu cầu bằng cấp.',
        ]);
    }

    private function xuLyMonDay(Request $request, int $id, array $duLieu): JsonResponse
    {
        $mucGia = GiasuGia::query()
            ->where('trang_thai', GiasuGia::TRANG_THAI_CHO_DUYET)
            ->with(['giasu.user', 'monHoc'])
            ->find($id);

        if (! $mucGia || ! $mucGia->giasu || ! $mucGia->monHoc) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy yêu cầu môn dạy chờ duyệt.',
            ], 404);
        }

        DB::transaction(function () use ($request, $mucGia, $duLieu) {
            $cacMucCungNhom = GiasuGia::query()
                ->where('giasu_id', $mucGia->giasu_id)
                ->where('trang_thai', GiasuGia::TRANG_THAI_CHO_DUYET)
                ->whereHas('monHoc', function ($query) use ($mucGia) {
                    $query
                        ->where('cap_hoc_id', $mucGia->monHoc->cap_hoc_id)
                        ->where('ten_mon', $mucGia->monHoc->ten_mon);
                })
                ->get();

            if ($duLieu['hanh_dong'] === 'duyet') {
                foreach ($cacMucCungNhom as $muc) {
                    $giaMoi = GiaTinhService::tinhGiaGiasu($muc->monhoc_id, $muc->giasu_id) ?? [];
                    $muc->update(array_merge($giaMoi, [
                        'trang_thai' => GiasuGia::TRANG_THAI_DA_DUYET,
                        'ly_do_tu_choi' => null,
                    ]));
                }

                $this->taoThongBao($mucGia->giasu, 'Môn dạy đã được duyệt', 'Yêu cầu bổ sung môn dạy của bạn đã được quản trị viên duyệt.');

                return;
            }

            $lyDo = trim((string) $duLieu['ly_do']);
            foreach ($cacMucCungNhom as $muc) {
                $muc->update([
                    'trang_thai' => GiasuGia::TRANG_THAI_TU_CHOI,
                    'ly_do_tu_choi' => $lyDo,
                ]);
            }

            $this->taoThongBao($mucGia->giasu, 'Môn dạy bị từ chối', "Yêu cầu bổ sung môn dạy của bạn bị từ chối. Lý do: {$lyDo}");
        });

        NhatKyHeThongService::ghi(
            $request->user(),
            $duLieu['hanh_dong'] === 'duyet' ? 'duyet_yeu_cau_chuyen_mon' : 'tu_choi_yeu_cau_chuyen_mon',
            $mucGia->id,
            $duLieu['hanh_dong'] === 'duyet'
                ? "Admin duyệt yêu cầu thêm môn {$mucGia->monHoc->ten_mon} của gia sư {$mucGia->giasu?->user?->ho_ten}."
                : "Admin từ chối yêu cầu thêm môn {$mucGia->monHoc->ten_mon} của gia sư {$mucGia->giasu?->user?->ho_ten}. Lý do: " . trim((string) $duLieu['ly_do'])
        );

        return response()->json([
            'success' => true,
            'message' => $duLieu['hanh_dong'] === 'duyet'
                ? 'Đã duyệt yêu cầu môn dạy.'
                : 'Đã từ chối yêu cầu môn dạy.',
        ]);
    }

    private function capNhatTrinhDoVaGia(Giasu $giaSu): void
    {
        $trinhDoCaoNhatId = $this->adminXetDuyetGiaSuService->layTrinhDoCaoNhatTuBangCap($giaSu);

        if ($trinhDoCaoNhatId) {
            $giaSu->update(['trinh_do_giasu_id' => $trinhDoCaoNhatId]);
        }

        $giaSu->giasuGias()
            ->whereIn('trang_thai', [
                GiasuGia::TRANG_THAI_CHO_DUYET,
                GiasuGia::TRANG_THAI_DA_DUYET,
            ])
            ->get()
            ->each(function (GiasuGia $mucGia) {
                $giaMoi = GiaTinhService::tinhGiaGiasu($mucGia->monhoc_id, $mucGia->giasu_id);
                if ($giaMoi) {
                    $mucGia->update($giaMoi);
                }
            });
    }

    private function taoThongBao(Giasu $giaSu, string $tieuDe, string $noiDung): void
    {
        ThongBao::create([
            'user_id' => $giaSu->user_id,
            'tieu_de' => $tieuDe,
            'noi_dung' => $noiDung,
            'url' => '/gia-su/quan-ly/ho-so',
            'da_doc' => false,
        ]);
    }

    private function quyDoiTrangThaiBangCap(string $trangThai): string
    {
        return match ($trangThai) {
            'duyet' => 'da_duyet',
            'tu_choi' => 'tu_choi',
            default => 'cho_duyet',
        };
    }

    private function quyDoiTrangThaiMonDay(string $trangThai): string
    {
        return match ($trangThai) {
            GiasuGia::TRANG_THAI_DA_DUYET => 'da_duyet',
            GiasuGia::TRANG_THAI_TU_CHOI => 'tu_choi',
            default => 'cho_duyet',
        };
    }

    private function tenLoaiBang(?string $loaiBang): string
    {
        return [
            'bang_cap' => 'Bằng cấp',
            'chung_chi' => 'Chứng chỉ',
            'khac' => 'Tài liệu khác',
        ][$loaiBang] ?? 'Chưa cập nhật';
    }

    private function dinhDangTien(float|string|null $giaTri): string
    {
        return number_format((float) ($giaTri ?? 0), 0, ',', '.') . 'đ';
    }
}

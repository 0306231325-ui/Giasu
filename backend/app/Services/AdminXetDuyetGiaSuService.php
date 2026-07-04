<?php

namespace App\Services;

use App\Models\Giasu;
use App\Models\GiasuBangCap;
use App\Models\GiasuGia;
use App\Models\MonHoc;

class AdminXetDuyetGiaSuService
{
    public function __construct(
        private readonly AdminGiaSuService $adminGiaSuService,
    ) {
    }

    public function dongBoMonDayTheoCapVaTen(Giasu $giaSu): void
    {
        $giaSu->loadMissing('giasuGias.monHoc:id,cap_hoc_id,ten_mon');

        $nhomMon = $giaSu->giasuGias
            ->filter(fn (GiasuGia $mucGia) => $mucGia->monHoc)
            ->map(fn (GiasuGia $mucGia) => $mucGia->monHoc)
            ->unique(fn (MonHoc $monHoc) => "{$monHoc->cap_hoc_id}|{$monHoc->ten_mon}")
            ->values();

        if ($nhomMon->isEmpty()) {
            return;
        }

        $tatCaMonTheoNhom = MonHoc::query()
            ->where(function ($query) use ($nhomMon) {
                foreach ($nhomMon as $monHoc) {
                    $query->orWhere(function ($subQuery) use ($monHoc) {
                        $subQuery
                            ->where('cap_hoc_id', $monHoc->cap_hoc_id)
                            ->where('ten_mon', $monHoc->ten_mon);
                    });
                }
            })
            ->get(['id']);

        $monDaCo = $giaSu->giasuGias->pluck('monhoc_id')->map(fn ($id) => (int) $id);

        foreach ($tatCaMonTheoNhom as $monHoc) {
            if ($monDaCo->contains((int) $monHoc->id)) {
                continue;
            }

            $giaSu->giasuGias()->create([
                'monhoc_id' => $monHoc->id,
                'trang_thai' => GiasuGia::TRANG_THAI_CHO_DUYET,
                'ly_do_tu_choi' => null,
            ]);
        }
    }

    public function dinhDangHoSoChoDuyet(Giasu $giaSu): array
    {
        $user = $giaSu->user;
        $bangCap = $giaSu->bangCaps
            ->map(fn (GiasuBangCap $taiLieu) => [
                'id' => $taiLieu->id,
                'ten' => $taiLieu->ten_bang,
                'loai' => $this->dinhDangLoaiBang($taiLieu->loai_bang),
                'trinhDo' => $taiLieu->trinhDo?->ten ?? 'Chưa chọn trình độ',
                'chuyenNganh' => $taiLieu->chuyen_nganh ?: 'Chưa cập nhật',
                'donVi' => $taiLieu->truong_don_vi ?: 'Chưa cập nhật',
                'trangThai' => $taiLieu->trang_thai,
                'urlXem' => "/admin/gia-su/bang-cap/{$taiLieu->id}/xem",
            ])
            ->values();

        $monDay = $giaSu->giasuGias
            ->filter(fn (GiasuGia $mucGia) => $mucGia->monHoc)
            ->groupBy(fn (GiasuGia $mucGia) => implode('|', [
                $mucGia->monHoc->cap_hoc_id,
                $mucGia->monHoc->ten_mon,
            ]))
            ->map(function ($nhomMucGia) {
                /** @var GiasuGia $mucGiaDaiDien */
                $mucGiaDaiDien = $nhomMucGia
                    ->sortBy(fn (GiasuGia $mucGia) => match ($mucGia->trang_thai) {
                        GiasuGia::TRANG_THAI_CHO_DUYET => 0,
                        GiasuGia::TRANG_THAI_DA_DUYET => 1,
                        GiasuGia::TRANG_THAI_TU_CHOI => 2,
                        default => 3,
                    })
                    ->first();

                return [
                    'id' => $mucGiaDaiDien->id,
                    'ten' => $mucGiaDaiDien->monHoc->ten_mon,
                    'cap' => $mucGiaDaiDien->monHoc->capHoc?->ten ?? 'Chưa cập nhật',
                    'soDongMon' => $nhomMucGia->count(),
                    'giaMon' => number_format((float) $mucGiaDaiDien->gia_mon, 0, ',', '.') . 'đ',
                    'giaCongTrinhDo' => number_format((float) $mucGiaDaiDien->gia_cong_trinh_do, 0, ',', '.') . 'đ',
                    'giaCongKinhNghiem' => number_format((float) $mucGiaDaiDien->gia_cong_kinh_nghiem, 0, ',', '.') . 'đ',
                    'giaCongThem' => number_format((float) $mucGiaDaiDien->gia_cong_them, 0, ',', '.') . 'đ',
                    'tongGia' => number_format((float) $mucGiaDaiDien->tong_gia, 0, ',', '.') . 'đ',
                    'trangThai' => $mucGiaDaiDien->trang_thai,
                ];
            })
            ->values();

        return [
            'id' => $giaSu->id,
            'hoTen' => $user?->ho_ten ?? 'Chưa cập nhật',
            'email' => $user?->email ?? 'Chưa cập nhật',
            'sdt' => $user?->sdt ?? 'Chưa cập nhật',
            'avatar' => $giaSu->avatar ?: $user?->anh_dai_dien,
            'avatarUrl' => $this->adminGiaSuService->taoUrlCongKhai($giaSu->avatar ?: $user?->anh_dai_dien),
            'ngaySinh' => $user?->ngay_sinh
                ? $user->ngay_sinh->format('d/m/Y')
                : 'Chưa cập nhật',
            'diaChi' => $giaSu->dia_chi ?: 'Chưa cập nhật',
            'ngayGui' => $giaSu->created_at
                ? $giaSu->created_at->format('d/m/Y · H:i')
                : 'Chưa cập nhật',
            'trinhDo' => $giaSu->trinhDo?->ten ?? $this->layTenTrinhDoCaoNhatTuBangCap($giaSu),
            'kinhNghiem' => $this->adminGiaSuService->dinhDangKinhNghiem(
                $giaSu->mucKinhNghiem?->tu_khoang,
                $giaSu->mucKinhNghiem?->den_khoang,
            ),
            'heSoGia' => (float) ($giaSu->he_so_gia ?? 0),
            'gioiThieu' => $giaSu->mo_ta ?: 'Chưa cập nhật giới thiệu.',
            'laHoSoGuiLai' => filled($giaSu->ly_do_tu_choi),
            'lyDoTuChoiLanTruoc' => $giaSu->ly_do_tu_choi,
            'bangCap' => $bangCap,
            'monDay' => $monDay,
        ];
    }

    public function layTrinhDoCaoNhatTuBangCap(Giasu $giaSu): ?int
    {
        return $giaSu->bangCaps()
            ->join('trinh_do_giasu', 'trinh_do_giasu.id', '=', 'giasu_bang_cap.trinh_do_giasu_id')
            ->orderByDesc('trinh_do_giasu.thu_tu')
            ->orderByDesc('trinh_do_giasu.id')
            ->value('giasu_bang_cap.trinh_do_giasu_id');
    }

    private function layTenTrinhDoCaoNhatTuBangCap(Giasu $giaSu): string
    {
        $bangCap = $giaSu->bangCaps
            ->filter(fn (GiasuBangCap $taiLieu) => $taiLieu->trinhDo)
            ->sortByDesc(fn (GiasuBangCap $taiLieu) => $taiLieu->trinhDo->thu_tu ?? 0)
            ->first();

        return $bangCap?->trinhDo?->ten ?? 'Chưa cập nhật';
    }

    private function dinhDangLoaiBang(?string $loaiBang): string
    {
        return match ($loaiBang) {
            'bang_cap' => 'Bằng cấp',
            'chung_chi' => 'Chứng chỉ',
            'khac' => 'Khác',
            default => 'Chưa phân loại',
        };
    }
}

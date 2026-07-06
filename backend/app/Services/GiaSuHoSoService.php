<?php

namespace App\Services;

use App\Models\DanhGia;
use App\Models\Giasu;
use App\Models\GiasuBangCap;
use App\Models\User;

class GiaSuHoSoService
{
    public function layHoSoGiaSu(?User $user): ?Giasu
    {
        if ($user?->vai_tro !== 'giasu') {
            return null;
        }

        return $user->giasu()->first();
    }

    public function dinhDangThongTinCaNhan(User $user, Giasu $giaSu): array
    {
        $thongKeDanhGia = DanhGia::query()
            ->join('lichhoc', 'lichhoc.id', '=', 'danhgia.lichhoc_id')
            ->where('lichhoc.giasu_id', $giaSu->id)
            ->selectRaw('COUNT(danhgia.id) as so_luong')
            ->selectRaw('COALESCE(AVG(danhgia.so_sao), 0) as trung_binh')
            ->first();

        $avatar = $giaSu->avatar ?: $user->anh_dai_dien;

        return [
            'ho_ten' => $user->ho_ten,
            'ngay_sinh' => $user->ngay_sinh?->format('Y-m-d'),
            'sdt' => $user->sdt,
            'email' => $user->email,
            'dia_chi' => $giaSu->dia_chi,
            'mo_ta' => $giaSu->mo_ta,
            'avatar' => $avatar,
            'avatar_url' => $this->taoUrlAnh($avatar),
            'diem_danh_gia' => round((float) $thongKeDanhGia->trung_binh, 1),
            'so_luong_danh_gia' => (int) $thongKeDanhGia->so_luong,
        ];
    }

    private function taoUrlAnh(?string $duongDan): ?string
    {
        if (! $duongDan) {
            return null;
        }

        if (preg_match('/^https?:\/\//i', $duongDan)) {
            return $duongDan;
        }

        return url(ltrim($duongDan, '/'));
    }

    public function dinhDangChuyenMon(Giasu $giaSu): array
    {
        $giaSu->loadMissing(['trinhDo:id,ten', 'mucKinhNghiem:id,tu_khoang,den_khoang']);

        return [
            'trinh_do_giasu_id' => $giaSu->trinh_do_giasu_id,
            'ten_trinh_do' => $giaSu->trinhDo?->ten,
            'muc_kinh_nghiem_id' => $giaSu->muc_kinh_nghiem_id,
            'muc_kinh_nghiem' => $giaSu->mucKinhNghiem
                ? [
                    'tu_khoang' => $giaSu->mucKinhNghiem->tu_khoang,
                    'den_khoang' => $giaSu->mucKinhNghiem->den_khoang,
                ]
                : null,
        ];
    }

    public function dinhDangBangCap(GiasuBangCap $bangCap): array
    {
        $bangCap->loadMissing('trinhDo:id,ten,thu_tu');

        return [
            'id' => $bangCap->id,
            'ten_bang' => $bangCap->ten_bang,
            'loai_bang' => $bangCap->loai_bang,
            'trinh_do_giasu_id' => $bangCap->trinh_do_giasu_id,
            'ten_trinh_do' => $bangCap->trinhDo?->ten,
            'thu_tu_trinh_do' => $bangCap->trinhDo?->thu_tu,
            'chuyen_nganh' => $bangCap->chuyen_nganh,
            'truong_don_vi' => $bangCap->truong_don_vi,
            'trang_thai' => $bangCap->trang_thai,
            'ly_do' => $bangCap->ly_do,
            'duyet_luc' => $bangCap->duyet_luc?->toISOString(),
            'created_at' => $bangCap->created_at?->toISOString(),
            'url_xem' => "/gia-su/ho-so/bang-cap/{$bangCap->id}/xem",
        ];
    }
}

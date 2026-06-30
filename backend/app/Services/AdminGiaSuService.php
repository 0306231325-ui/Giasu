<?php

namespace App\Services;

use App\Models\Giasu;

class AdminGiaSuService
{
    public function dinhDangGiaSu(Giasu $giaSu): array
    {
        $mucKinhNghiem = $giaSu->mucKinhNghiem;
        $monDay = $giaSu->giasuGias
            ->pluck('monHoc.ten_mon')
            ->filter()
            ->unique()
            ->values();

        return [
            'id' => $giaSu->id,
            'hoTen' => $giaSu->user?->ho_ten ?? 'Chưa cập nhật',
            'email' => $giaSu->user?->email ?? 'Chưa cập nhật',
            'sdt' => $giaSu->user?->sdt ?? 'Chưa cập nhật',
            'trinhDoId' => $giaSu->trinh_do_giasu_id,
            'trinhDo' => $giaSu->trinhDo?->ten ?? 'Chưa cập nhật',
            'kinhNghiem' => $this->dinhDangKinhNghiem(
                $mucKinhNghiem?->tu_khoang,
                $mucKinhNghiem?->den_khoang,
            ),
            'monDay' => $monDay,
            'soMon' => $monDay->count(),
            'danhGia' => round((float) ($giaSu->diem_danh_gia ?? 0), 1),
            'soDanhGia' => (int) ($giaSu->so_danh_gia ?? 0),
            'ngayDuyet' => $giaSu->duyet_luc
                ? date('d/m/Y', strtotime($giaSu->duyet_luc))
                : 'Chưa cập nhật',
            'ngayXuLy' => $giaSu->duyet_luc
                ? date('d/m/Y · H:i', strtotime($giaSu->duyet_luc))
                : 'Chưa cập nhật',
            'lyDoTuChoi' => $giaSu->ly_do_tu_choi ?: 'Chưa cập nhật lý do.',
            'trangThaiHoSo' => $giaSu->trang_thai_ho_so,
            'trangThai' => $giaSu->user?->trang_thai ?? 'khoa',
        ];
    }

    public function taoUrlCongKhai(?string $duongDan): ?string
    {
        if (! $duongDan) {
            return null;
        }

        if (str_starts_with($duongDan, 'http://') || str_starts_with($duongDan, 'https://')) {
            return $duongDan;
        }

        return url(ltrim($duongDan, '/'));
    }

    public function dinhDangKinhNghiem(?int $tuKhoang, ?int $denKhoang): string
    {
        if ($tuKhoang === null) {
            return 'Chưa cập nhật';
        }

        if ($denKhoang === null) {
            return "Từ {$tuKhoang} năm kinh nghiệm";
        }

        if ($tuKhoang === $denKhoang) {
            return "{$tuKhoang} năm kinh nghiệm";
        }

        return "{$tuKhoang} - {$denKhoang} năm kinh nghiệm";
    }
}

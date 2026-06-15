<?php

namespace App\Services;

use App\Models\Giasu;
use App\Models\MonHoc;

class GiaTinhService
{
    public static function tinhGiaGiasu(int $monhocId, int $giasuId): ?array
    {
        $monhoc = MonHoc::find($monhocId);
        $giasu = Giasu::with(['trinhDo', 'mucKinhNghiem'])->find($giasuId);

        if (! $monhoc || ! $giasu) {
            return null;
        }

        $giaMon = (float) $monhoc->gia;
        $giaCongTrinhDo = (float) ($giasu->trinhDo?->gia_cong_them ?? 0);
        $giaCongKinhNghiem = (float) ($giasu->mucKinhNghiem?->gia_cong_them ?? 0);

        return [
            'giasu_id' => $giasuId,
            'monhoc_id' => $monhocId,
            'trinh_do_giasu_id' => $giasu->trinh_do_giasu_id,
            'gia_mon' => $giaMon,
            'gia_cong_trinh_do' => $giaCongTrinhDo,
            'gia_cong_kinh_nghiem' => $giaCongKinhNghiem,
            'tong_gia' => $giaMon + $giaCongTrinhDo + $giaCongKinhNghiem,
        ];
    }

    /** @deprecated Dùng tinhGiaGiasu */
    public static function tinhGiaGiasuMon(int $monhocId, int $giasuId): ?float
    {
        $result = self::tinhGiaGiasu($monhocId, $giasuId);

        return $result ? $result['tong_gia'] : null;
    }

    /** @deprecated Dùng tinhGiaGiasu */
    public static function tinhGiaChuan(int $monhocId, ?int $lopId = null, ?int $giasuId = null): ?float
    {
        if ($giasuId) {
            return self::tinhGiaGiasuMon($monhocId, $giasuId);
        }

        $monhoc = MonHoc::find($monhocId);

        return $monhoc ? (float) $monhoc->gia : null;
    }
}

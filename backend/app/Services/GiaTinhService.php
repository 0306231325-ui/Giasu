<?php

namespace App\Services;

use App\Models\Giasu;
use App\Models\MonHoc;
use App\Models\MucKinhNghiem;
use App\Models\TrinhDoGiasu;

class GiaTinhService
{
    public static function tinhGiaDuKien(
        array $monhocIds,
        int $trinhDoGiasuId,
        int $mucKinhNghiemId
    ): array {
        $trinhDo = TrinhDoGiasu::find($trinhDoGiasuId);
        $mucKinhNghiem = MucKinhNghiem::find($mucKinhNghiemId);

        if (! $trinhDo || ! $mucKinhNghiem) {
            return [];
        }

        $giaCongTrinhDo = (float) $trinhDo->gia_cong_them;
        $giaCongKinhNghiem = (float) $mucKinhNghiem->gia_cong_them;

        return MonHoc::query()
            ->whereIn('id', $monhocIds)
            ->orderBy('ten_mon')
            ->get(['id', 'ten_mon', 'gia'])
            ->map(function (MonHoc $monhoc) use ($giaCongTrinhDo, $giaCongKinhNghiem) {
                $giaMon = (float) $monhoc->gia;

                return [
                    'monhoc_id' => $monhoc->id,
                    'ten_mon' => $monhoc->ten_mon,
                    'gia_mon' => $giaMon,
                    'gia_cong_trinh_do' => $giaCongTrinhDo,
                    'gia_cong_kinh_nghiem' => $giaCongKinhNghiem,
                    'tong_gia' => $giaMon + $giaCongTrinhDo + $giaCongKinhNghiem,
                ];
            })
            ->all();
    }

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

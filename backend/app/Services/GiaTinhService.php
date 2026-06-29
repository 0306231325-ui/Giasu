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
            ->with('capHoc:id,ten')
            ->whereIn('id', $monhocIds)
            ->orderBy('ten_mon')
            ->get(['id', 'ten_mon', 'cap_hoc_id', 'gia'])
            ->map(function (MonHoc $monhoc) use ($giaCongTrinhDo, $giaCongKinhNghiem) {
                $giaMon = (float) $monhoc->gia;
                $giaCoBan = $giaMon + $giaCongTrinhDo + $giaCongKinhNghiem;

                return [
                    'monhoc_id' => $monhoc->id,
                    'ten_mon' => $monhoc->ten_mon,
                    'cap_hoc' => $monhoc->capHoc?->ten,
                    'gia_mon' => $giaMon,
                    'gia_cong_trinh_do' => $giaCongTrinhDo,
                    'gia_cong_kinh_nghiem' => $giaCongKinhNghiem,
                    'gia_cong_them' => 0,
                    'he_so_gia' => 0,
                    'tong_gia' => $giaCoBan,
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
        $heSoGia = (float) ($giasu->he_so_gia ?? 0);
        $giaCoBan = $giaMon + $giaCongTrinhDo + $giaCongKinhNghiem;
        $giaCongThem = $giaCoBan * $heSoGia / 100;

        return [
            'giasu_id' => $giasuId,
            'monhoc_id' => $monhocId,
            'gia_mon' => $giaMon,
            'gia_cong_trinh_do' => $giaCongTrinhDo,
            'gia_cong_kinh_nghiem' => $giaCongKinhNghiem,
            'gia_cong_them' => $giaCongThem,
            'tong_gia' => $giaCoBan + $giaCongThem,
        ];
    }


}

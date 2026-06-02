<?php

namespace App\Services;

use App\Models\BangGiaGoc;
use App\Models\CauHinhGia;
use App\Models\Lop;

class GiaTinhService
{
    public static function tinhGiaChuan(int $monhocId, int $lopId): ?float
    {
        $lop = Lop::find($lopId);
        if (! $lop) {
            return null;
        }

        $goc = BangGiaGoc::where('monhoc_id', $monhocId)
            ->where('cap_hoc_id', $lop->cap_hoc_id)
            ->first();

        if (! $goc) {
            return null;
        }

        $tangTheoLop = (float) (CauHinhGia::where('ma', 'tang_theo_lop')->value('gia_tri') ?? 0);

        return (float) $goc->gia_goc
            + max(0, $lop->thu_tu_trong_cap - 1) * $tangTheoLop;
    }

    public static function tinhGiaMin(int $monhocId, int $lopId): ?float
    {
        $giaChuan = self::tinhGiaChuan($monhocId, $lopId);
        if ($giaChuan === null) {
            return null;
        }

        $lop = Lop::find($lopId);
        $goc = BangGiaGoc::where('monhoc_id', $monhocId)
            ->where('cap_hoc_id', $lop->cap_hoc_id)
            ->first();

        if ($goc?->gia_min !== null) {
            return (float) $goc->gia_min
                + max(0, $lop->thu_tu_trong_cap - 1) * (float) (CauHinhGia::where('ma', 'tang_theo_lop')->value('gia_tri') ?? 0);
        }

        return $giaChuan * 0.9;
    }

    public static function tinhGiaMax(int $monhocId, int $lopId): ?float
    {
        $giaChuan = self::tinhGiaChuan($monhocId, $lopId);
        if ($giaChuan === null) {
            return null;
        }

        $lop = Lop::find($lopId);
        $goc = BangGiaGoc::where('monhoc_id', $monhocId)
            ->where('cap_hoc_id', $lop->cap_hoc_id)
            ->first();

        if ($goc?->gia_max !== null) {
            return (float) $goc->gia_max
                + max(0, $lop->thu_tu_trong_cap - 1) * (float) (CauHinhGia::where('ma', 'tang_theo_lop')->value('gia_tri') ?? 0);
        }

        return $giaChuan * 1.1;
    }
}

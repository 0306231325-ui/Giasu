<?php

namespace App\Services;

use App\Models\Giasu;
use App\Models\GiasuGia;
use App\Models\MonHoc;

class GiaSuMonDayService
{
    public function danhSachMonDaDangKy(Giasu $giaSu)
    {
        return $giaSu->giasuGias()
            ->with('monHoc.capHoc:id,ten')
            ->where('trang_thai', '!=', GiasuGia::TRANG_THAI_NGUNG_DAY)
            ->latest()
            ->get()
            ->filter(fn (GiasuGia $mucGia) => $mucGia->monHoc)
            ->groupBy(fn (GiasuGia $mucGia) => implode('|', [
                $mucGia->monHoc->cap_hoc_id,
                $mucGia->monHoc->ten_mon,
            ]))
            ->map(function ($cacMucGia) {
                $mucGia = $cacMucGia->sortBy(fn (GiasuGia $muc) => match ($muc->trang_thai) {
                    GiasuGia::TRANG_THAI_CHO_DUYET => 1,
                    GiasuGia::TRANG_THAI_TU_CHOI => 2,
                    default => 3,
                })->first();

                return [
                    'id' => $mucGia->id,
                    'tenMon' => $mucGia->monHoc->ten_mon,
                    'capHocId' => $mucGia->monHoc->cap_hoc_id,
                    'capHoc' => $mucGia->monHoc->capHoc?->ten,
                    'gia' => (float) $mucGia->tong_gia,
                    'trangThai' => $mucGia->trang_thai,
                    'lyDo' => $mucGia->ly_do_tu_choi,
                ];
            })
            ->values();
    }

    public function danhSachMonCoTheThem(Giasu $giaSu)
    {
        $monDaCoTheoCapVaTen = $giaSu->giasuGias()
            ->join('monhoc', 'monhoc.id', '=', 'giasu_gia.monhoc_id')
            ->get(['monhoc.cap_hoc_id', 'monhoc.ten_mon'])
            ->mapWithKeys(fn ($monHoc) => [
                "{$monHoc->cap_hoc_id}|{$monHoc->ten_mon}" => true,
            ]);

        return MonHoc::query()
            ->with('capHoc:id,ten')
            ->orderBy('cap_hoc_id')
            ->orderBy('ten_mon')
            ->get(['id', 'ten_mon', 'cap_hoc_id', 'lop', 'gia'])
            ->unique(fn (MonHoc $monHoc) => "{$monHoc->cap_hoc_id}|{$monHoc->ten_mon}")
            ->reject(fn (MonHoc $monHoc) => $monDaCoTheoCapVaTen->has(
                "{$monHoc->cap_hoc_id}|{$monHoc->ten_mon}",
            ))
            ->map(function (MonHoc $monHoc) use ($giaSu) {
                $giaDuKien = GiaTinhService::tinhGiaGiasu($monHoc->id, $giaSu->id) ?? [];

                return [
                    'id' => $monHoc->id,
                    'ten_mon' => $monHoc->ten_mon,
                    'cap_hoc_id' => $monHoc->cap_hoc_id,
                    'cap_hoc' => $monHoc->capHoc?->ten,
                    'gia_mon' => (float) ($giaDuKien['gia_mon'] ?? $monHoc->gia ?? 0),
                    'gia_cong_trinh_do' => (float) ($giaDuKien['gia_cong_trinh_do'] ?? 0),
                    'gia_cong_kinh_nghiem' => (float) ($giaDuKien['gia_cong_kinh_nghiem'] ?? 0),
                    'gia_cong_them' => (float) ($giaDuKien['gia_cong_them'] ?? 0),
                    'tong_gia' => (float) ($giaDuKien['tong_gia'] ?? $monHoc->gia ?? 0),
                ];
            })
            ->values();
    }

    public function layTatCaMonTheoCapVaTen(array $monHocIds)
    {
        $monDaiDien = MonHoc::query()
            ->whereIn('id', $monHocIds)
            ->get(['id', 'cap_hoc_id', 'ten_mon']);

        $nhomMon = $monDaiDien
            ->unique(fn (MonHoc $monHoc) => "{$monHoc->cap_hoc_id}|{$monHoc->ten_mon}")
            ->values();

        if ($nhomMon->isEmpty()) {
            return collect();
        }

        return MonHoc::query()
            ->where(function ($query) use ($nhomMon) {
                foreach ($nhomMon as $monHoc) {
                    $query->orWhere(function ($subQuery) use ($monHoc) {
                        $subQuery
                            ->where('cap_hoc_id', $monHoc->cap_hoc_id)
                            ->where('ten_mon', $monHoc->ten_mon);
                    });
                }
            })
            ->orderBy('cap_hoc_id')
            ->orderBy('ten_mon')
            ->orderBy('lop')
            ->get(['id', 'cap_hoc_id', 'ten_mon', 'lop']);
    }
}

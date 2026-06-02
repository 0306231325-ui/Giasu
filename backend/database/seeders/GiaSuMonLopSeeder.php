<?php

namespace Database\Seeders;

use App\Services\GiaTinhService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class GiaSuMonLopSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $lopThpt = DB::table('lop')
            ->join('cap_hoc', 'lop.cap_hoc_id', '=', 'cap_hoc.id')
            ->where('cap_hoc.ma', 'thpt')
            ->pluck('lop.id', 'lop.so_lop');

        $lopThcs = DB::table('lop')
            ->join('cap_hoc', 'lop.cap_hoc_id', '=', 'cap_hoc.id')
            ->where('cap_hoc.ma', 'thcs')
            ->pluck('lop.id', 'lop.so_lop');

        $assignments = [
            ['giasu_id' => 1, 'monhoc_id' => 1, 'lops' => [10, 11, 12]],
            ['giasu_id' => 1, 'monhoc_id' => 2, 'lops' => [10, 11, 12]],
            ['giasu_id' => 2, 'monhoc_id' => 1, 'lops' => [10, 11, 12]],
            ['giasu_id' => 2, 'monhoc_id' => 2, 'lops' => [10, 11, 12]],
            ['giasu_id' => 3, 'monhoc_id' => 3, 'lops' => [10, 11, 12]],
            ['giasu_id' => 4, 'monhoc_id' => 2, 'lops' => [10, 11, 12]],
            ['giasu_id' => 5, 'monhoc_id' => 1, 'lops' => [6, 7, 8, 9, 10, 11, 12]],
        ];

        foreach ($assignments as $item) {
            foreach ($item['lops'] as $soLop) {
                $lopId = $lopThpt[$soLop] ?? $lopThcs[$soLop] ?? null;
                if (! $lopId) {
                    continue;
                }

                DB::table('giasu_mon_lop')->updateOrInsert(
                    [
                        'giasu_id' => $item['giasu_id'],
                        'monhoc_id' => $item['monhoc_id'],
                        'lop_id' => $lopId,
                    ],
                    [
                        'giasu_id' => $item['giasu_id'],
                        'monhoc_id' => $item['monhoc_id'],
                        'lop_id' => $lopId,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]
                );
            }
        }

        $monLops = DB::table('giasu_mon_lop')->get();

        foreach ($monLops as $item) {
            $gia = GiaTinhService::tinhGiaChuan($item->monhoc_id, $item->lop_id);
            if ($gia === null) {
                continue;
            }

            DB::table('giasu_gia')->updateOrInsert(
                [
                    'giasu_id' => $item->giasu_id,
                    'monhoc_id' => $item->monhoc_id,
                    'lop_id' => $item->lop_id,
                ],
                [
                    'giasu_id' => $item->giasu_id,
                    'monhoc_id' => $item->monhoc_id,
                    'lop_id' => $item->lop_id,
                    'gia_theogio' => $gia,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
    }
}

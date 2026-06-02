<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LopSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();
        $capMap = DB::table('cap_hoc')->pluck('id', 'ma');

        $lopTheoCap = [
            'tieu_hoc' => [1, 2, 3, 4, 5],
            'thcs' => [6, 7, 8, 9],
            'thpt' => [10, 11, 12],
            'cao_dang' => [1, 2, 3],
            'dai_hoc' => [1, 2, 3, 4],
        ];

        foreach ($lopTheoCap as $maCap => $soLops) {
            if (! isset($capMap[$maCap])) {
                continue;
            }

            $capId = $capMap[$maCap];
            $thuTu = 1;

            foreach ($soLops as $soLop) {
                $ten = in_array($maCap, ['cao_dang', 'dai_hoc'], true)
                    ? "Năm {$soLop}"
                    : "Lớp {$soLop}";

                DB::table('lop')->updateOrInsert(
                    ['so_lop' => $soLop, 'cap_hoc_id' => $capId],
                    [
                        'ten' => $ten,
                        'so_lop' => $soLop,
                        'cap_hoc_id' => $capId,
                        'thu_tu_trong_cap' => $thuTu,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]
                );

                $thuTu++;
            }
        }
    }
}

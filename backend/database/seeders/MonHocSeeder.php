<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MonHocSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();
        $capMap = DB::table('cap_hoc')->pluck('id', 'ma');

        $giaGocTheoMon = [
            'Toán Học' => 100000,
            'Vật Lý' => 120000,
            'Tiếng Anh' => 200000,
        ];

        $lopTheoCap = [
            'tieu_hoc' => [1, 2, 3, 4, 5],
            'thcs' => [6, 7, 8, 9],
            'thpt' => [10, 11, 12],
            'cao_dang' => [1, 2, 3],
            'dai_hoc' => [1, 2, 3, 4],
        ];

        foreach ($giaGocTheoMon as $tenMon => $giaGoc) {
            foreach ($lopTheoCap as $maCap => $soLops) {
                if (! isset($capMap[$maCap])) {
                    continue;
                }

                $cap = DB::table('cap_hoc')->where('ma', $maCap)->first();
                $thuTuTrongCap = 1;

                foreach ($soLops as $soLop) {
                    $gia = $giaGoc
                        + max(0, ((int) $cap->thu_tu) - 1) * 100000
                        + max(0, $thuTuTrongCap - 1) * 50000;

                    DB::table('monhoc')->updateOrInsert(
                        [
                            'cap_hoc_id' => $cap->id,
                            'ten_mon' => $tenMon,
                            'so_lop' => $soLop,
                        ],
                        [
                            'cap_hoc_id' => $cap->id,
                            'ten_mon' => $tenMon,
                            'so_lop' => $soLop,
                            'thu_tu_trong_cap' => $thuTuTrongCap,
                            'gia' => $gia,
                            'mo_ta' => $tenMon . ' - ' . $cap->ten . ' - Lớp ' . $soLop,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]
                    );

                    $thuTuTrongCap++;
                }
            }
        }
    }
}

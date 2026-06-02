<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BangGiaGocSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();
        $capMap = DB::table('cap_hoc')->pluck('id', 'ma');
        $monMap = DB::table('monhoc')->pluck('id', 'ten_mon');

        $giaGoc = [
            'Toán Học' => [
                'tieu_hoc' => ['goc' => 100000, 'min' => 80000, 'max' => 130000],
                'thcs' => ['goc' => 200000, 'min' => 170000, 'max' => 250000],
                'thpt' => ['goc' => 250000, 'min' => 220000, 'max' => 300000],
                'cao_dang' => ['goc' => 280000, 'min' => 250000, 'max' => 320000],
                'dai_hoc' => ['goc' => 300000, 'min' => 270000, 'max' => 350000],
            ],
            'Vật Lý' => [
                'tieu_hoc' => ['goc' => 120000, 'min' => 100000, 'max' => 150000],
                'thcs' => ['goc' => 210000, 'min' => 180000, 'max' => 260000],
                'thpt' => ['goc' => 260000, 'min' => 230000, 'max' => 310000],
                'cao_dang' => ['goc' => 290000, 'min' => 260000, 'max' => 330000],
                'dai_hoc' => ['goc' => 310000, 'min' => 280000, 'max' => 360000],
            ],
            'Tiếng Anh' => [
                'tieu_hoc' => ['goc' => 200000, 'min' => 170000, 'max' => 240000],
                'thcs' => ['goc' => 300000, 'min' => 270000, 'max' => 350000],
                'thpt' => ['goc' => 350000, 'min' => 320000, 'max' => 400000],
                'cao_dang' => ['goc' => 380000, 'min' => 350000, 'max' => 430000],
                'dai_hoc' => ['goc' => 400000, 'min' => 370000, 'max' => 450000],
            ],
        ];

        foreach ($giaGoc as $tenMon => $theoCap) {
            if (! isset($monMap[$tenMon])) {
                continue;
            }

            foreach ($theoCap as $maCap => $price) {
                if (! isset($capMap[$maCap])) {
                    continue;
                }

                DB::table('bang_gia_goc')->updateOrInsert(
                    [
                        'monhoc_id' => $monMap[$tenMon],
                        'cap_hoc_id' => $capMap[$maCap],
                    ],
                    [
                        'monhoc_id' => $monMap[$tenMon],
                        'cap_hoc_id' => $capMap[$maCap],
                        'gia_goc' => $price['goc'],
                        'gia_min' => $price['min'],
                        'gia_max' => $price['max'],
                        'ghi_chu' => null,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]
                );
            }
        }
    }
}

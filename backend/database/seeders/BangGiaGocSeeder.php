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
        $monMap = DB::table('monhoc')->pluck('id', 'ten_mon');

        // Giá gốc tại cấp thấp nhất (tiểu học) cho mỗi môn.
        // Giá theo cấp sẽ được tính bằng cau_hinh_gia.tang_theo_cap (=100k).
        $giaGoc = [
            'Toán Học' => ['goc' => 100000, 'min' => 80000, 'max' => 130000],
            'Vật Lý' => ['goc' => 120000, 'min' => 100000, 'max' => 150000],
            'Tiếng Anh' => ['goc' => 200000, 'min' => 170000, 'max' => 240000],
        ];

        foreach ($giaGoc as $tenMon => $price) {
            if (! isset($monMap[$tenMon])) {
                continue;
            }

            DB::table('bang_gia_goc')->updateOrInsert(
                [
                    'monhoc_id' => $monMap[$tenMon],
                ],
                [
                    'monhoc_id' => $monMap[$tenMon],
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

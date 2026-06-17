<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LoaiGoiSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $rows = [
            [
                'ten_loai_goi' => 'Gói 1 tháng',
                'so_thang' => 1,
                'phan_tram_giam' => 0,
                'mo_ta' => 'Gói học trong 1 tháng',
            ],
            [
                'ten_loai_goi' => 'Gói 3 tháng',
                'so_thang' => 3,
                'phan_tram_giam' => 5,
                'mo_ta' => 'Giảm 5% khi đăng ký gói 3 tháng',
            ],
            [
                'ten_loai_goi' => 'Gói 6 tháng',
                'so_thang' => 6,
                'phan_tram_giam' => 10,
                'mo_ta' => 'Giảm 10% khi đăng ký gói 6 tháng',
            ],
        ];

        foreach ($rows as $row) {
            DB::table('loai_goi')->updateOrInsert(
                ['so_thang' => $row['so_thang']],
                array_merge($row, [
                    'created_at' => $now,
                    'updated_at' => $now,
                ])
            );
        }
    }
}

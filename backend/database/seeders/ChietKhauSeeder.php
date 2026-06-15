<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ChietKhauSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $rows = [
            ['so_buoi' => 1, 'phan_tram_giam' => 0, 'mo_ta' => 'Không giảm giá'],
            ['so_buoi' => 5, 'phan_tram_giam' => 5, 'mo_ta' => 'Giảm 5% khi đăng ký từ 5 buổi'],
            ['so_buoi' => 10, 'phan_tram_giam' => 10, 'mo_ta' => 'Giảm 10% khi đăng ký từ 10 buổi'],
        ];

        foreach ($rows as $row) {
            DB::table('chietkhau')->updateOrInsert(
                ['so_buoi' => $row['so_buoi']],
                array_merge($row, [
                    'created_at' => $now,
                    'updated_at' => $now,
                ])
            );
        }
    }
}

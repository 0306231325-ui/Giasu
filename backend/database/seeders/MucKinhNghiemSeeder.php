<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MucKinhNghiemSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $rows = [
            ['tu_khoang' => 0, 'den_khoang' => 0, 'gia_cong_them' => 0],
            ['tu_khoang' => 1, 'den_khoang' => 2, 'gia_cong_them' => 20000],
            ['tu_khoang' => 3, 'den_khoang' => 5, 'gia_cong_them' => 50000],
            ['tu_khoang' => 6, 'den_khoang' => null, 'gia_cong_them' => 80000],
        ];

        foreach ($rows as $row) {
            DB::table('muc_kinh_nghiem')->updateOrInsert(
                [
                    'tu_khoang' => $row['tu_khoang'],
                    'den_khoang' => $row['den_khoang'],
                ],
                array_merge($row, ['created_at' => $now, 'updated_at' => $now])
            );
        }
    }
}

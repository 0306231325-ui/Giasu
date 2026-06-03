<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CauHinhGiaSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        DB::table('cau_hinh_gia')->updateOrInsert(
            ['ma' => 'tang_theo_lop'],
            [
                'ma' => 'tang_theo_lop',
                'gia_tri' => 50000,
                'mo_ta' => 'Mức cộng thêm mỗi bậc lớp trong cùng cấp học',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );

        DB::table('cau_hinh_gia')->updateOrInsert(
            ['ma' => 'tang_theo_cap'],
            [
                'ma' => 'tang_theo_cap',
                'gia_tri' => 100000,
                'mo_ta' => 'Mức cộng thêm mỗi cấp học (Tiểu -> THCS -> THPT ...)',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );
    }
}

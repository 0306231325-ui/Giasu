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
        DB::table('monhoc')->insert([
            ['ten_mon' => 'Toán Học', 'mo_ta' => 'Toán từ lớp 1 đến lớp 12', 'created_at' => $now, 'updated_at' => $now],
            ['ten_mon' => 'Vật Lý', 'mo_ta' => 'Lý cấp 2, cấp 3', 'created_at' => $now, 'updated_at' => $now],
            ['ten_mon' => 'Tiếng Anh', 'mo_ta' => 'Tiếng Anh giao tiếp, IELTS', 'created_at' => $now, 'updated_at' => $now],
        ]);
    }
}

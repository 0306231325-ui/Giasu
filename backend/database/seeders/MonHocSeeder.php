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
        $rows = [
            ['ten_mon' => 'Toán Học', 'mo_ta' => 'Toán Hoc Dai So Hinh Hoc'],
            ['ten_mon' => 'Vật Lý', 'mo_ta' => 'Lý Day Ly Thuyet Co Ca Thuc Hanh'],
            ['ten_mon' => 'Tiếng Anh', 'mo_ta' => 'Tiếng Anh giao tiếp, IELTS'],
        ];

        foreach ($rows as $row) {
            DB::table('monhoc')->updateOrInsert(
                ['ten_mon' => $row['ten_mon']],
                array_merge($row, ['created_at' => $now, 'updated_at' => $now])
            );
        }
    }
}

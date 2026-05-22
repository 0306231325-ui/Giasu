<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ThanhToanSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('thanhtoan')->insert([
            'goihoc_id' => 1, 'so_tien' => 1800000.00, 'phuong_thuc' => 'banking', 'ma_giaodich' => 'VN123456789', 'trang_thai' => 'da_thanhtoan', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()
        ]);
    }
}
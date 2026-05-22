<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class GoiHocSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('goihoc')->insert([
            'hocvien_id' => 2, 'giasu_id' => 1, 'monhoc_id' => 1, 'ngay_batdau' => Carbon::now()->addDays(1)->toDateString(), 'ngay_ketthuc' => Carbon::now()->addDays(30)->toDateString(), 'so_buoi' => 12, 'hoc_dinhky' => 1, 'tong_tien' => 1800000.00, 'trang_thai' => 'danghoc', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()
        ]);
    }
}
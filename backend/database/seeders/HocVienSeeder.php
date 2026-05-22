<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class HocVienSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('hocvien')->insert([
            'user_id' => 2, 'lop' => 'Lớp 12', 'truong_hoc' => 'THPT Lê Hồng Phong', 'dia_chi' => 'Quận 1, TP.HCM', 'ten_phu_huynh' => 'Nguyễn Văn Lieem', 'sdt_phu_huynh' => '0999888777', 'muc_tieu_hoc_tap' => 'Thi đậu Đại Học Bách Khoa', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()
        ]);
    }
}
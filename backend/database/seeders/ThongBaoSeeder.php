<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ThongBaoSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();
        DB::table('thongbao')->insert([
            ['user_id' => 2, 'tieu_de' => 'Xác nhận thanh toán', 'noi_dung' => 'Gói học Toán đã được thanh toán.', 'da_doc' => 0, 'created_at' => $now, 'updated_at' => $now],
            ['user_id' => 3, 'tieu_de' => 'Có học viên mới', 'noi_dung' => 'Bạn vừa nhận được yêu cầu dạy.', 'da_doc' => 0, 'created_at' => $now, 'updated_at' => $now],
        ]);
    }
}

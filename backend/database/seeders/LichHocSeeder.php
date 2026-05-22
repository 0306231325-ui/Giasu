<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LichHocSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('lichhoc')->insert([
            'goihoc_id' => 1, 'ngay_hoc' => Carbon::now()->addDays(2)->toDateString(), 'gio_batdau' => '18:00:00', 'gio_ketthuc' => '20:00:00', 'phi_hoahong' => 30000.00, 'tien_giasu_nhan' => 270000.00, 'trang_thai' => 'da_nhan', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()
        ]);
    }
}
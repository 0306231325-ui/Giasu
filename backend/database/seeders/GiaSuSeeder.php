<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class GiaSuSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('giasu')->insert([
            'user_id' => 3, 'mo_ta' => 'Gia sư nhiệt tình, tận tâm.', 'kinh_nghiem' => '3 năm dạy kèm', 'hoc_van' => 'Đại học Sư Phạm TP.HCM', 'gia_theogio' => 150000.00, 'dia_chi' => 'Quận 5, TP.HCM', 'tong_danhgia' => 4.5, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()
        ]);
    }
}

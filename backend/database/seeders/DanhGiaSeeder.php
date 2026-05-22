<?php

namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DanhGiaSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('danhgia')->insert([
            'lichhoc_id' => 1, 'so_sao' => 5, 'noi_dung' => ' dạy rất dễ hiểu!, tay roi ban oi ', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()
        ]);
    }
}
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BannerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('banner')->insert([
            [
                'tieu_de' => 'Banner 1',
                'mo_ta' => 'Bai Viet Moi Nhat Ve Gia Su',
                'anh' => 'images/ANHGS1.jpg',
                'trang_thai' => 'hienthi',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'tieu_de' => 'Banner 2',
                'mo_ta' => 'Cac Mon Hoc ',
                'anh' => 'images/ANHGS2.jpg',
                'trang_thai' => 'hienthi',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'tieu_de' => 'Banner 3',
                'mo_ta' => 'Gia Su ',
                'anh' => 'images/ANHGS3.jpg',
                'trang_thai' => 'hienthi',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);
    }
}

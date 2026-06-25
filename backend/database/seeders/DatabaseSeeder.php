<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CapHocSeeder::class,
            TrinhDoGiasuSeeder::class,
            MucKinhNghiemSeeder::class,
            MonHocSeeder::class,
            UsersSeeder::class,
            LoaiGoiSeeder::class,
            BaiVietSeeder::class,
            BannerSeeder::class,
        ]);
    }
}

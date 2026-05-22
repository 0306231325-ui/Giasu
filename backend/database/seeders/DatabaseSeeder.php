<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UsersSeeder::class,
            HocVienSeeder::class,
            GiaSuSeeder::class,
            MonHocSeeder::class,
            GiaSuMonHocSeeder::class,
            BaiVietSeeder::class,
            GoiHocSeeder::class,
            LichHocSeeder::class,
            DanhGiaSeeder::class,
            ThanhToanSeeder::class,
            LichRanhSeeder::class,
            ThongBaoSeeder::class,
            BannerSeeder::class,
        ]);
    }
}
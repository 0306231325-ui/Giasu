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
            MonHocSeeder::class,
            UsersSeeder::class,
            HocVienSeeder::class,
            GiaSuSeeder::class,
            GiaSuGiaSeeder::class,
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

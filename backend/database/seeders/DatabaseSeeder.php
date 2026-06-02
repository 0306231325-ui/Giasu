<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CapHocSeeder::class,
            MonHocSeeder::class,
            LopSeeder::class,
            BangGiaGocSeeder::class,
            CauHinhGiaSeeder::class,
            UsersSeeder::class,
            HocVienSeeder::class,
            GiaSuSeeder::class,
            GiaSuMonLopSeeder::class, // sau GiaSuSeeder: giasu_mon_lop + giasu_gia
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

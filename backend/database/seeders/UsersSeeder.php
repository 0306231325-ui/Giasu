<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        DB::table('users')->updateOrInsert(
            ['email' => 'vul53290@gmail.com'],
            [
                'ho_ten' => 'Vu Thien Phu (Admin)',
                'ngay_sinh' => null,
                'password' => '@Thienphu2005',
                'sdt' => '0328778433',
                'vai_tro' => 'admin',
                'anh_dai_dien' => null,
                'trang_thai' => 'hoatdong',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        );
    }
}

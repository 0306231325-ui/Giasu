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

        $hocViens = [
            ['ho_ten' => 'Võ Tấn Hiên', 'email' => 'tanhien@gmail.com', 'sdt' => '0328778411', 'ngay_sinh' => '2008-01-12'],
            ['ho_ten' => 'Thiên Vũ Phú', 'email' => 'thienphu@gmail.com', 'sdt' => '0328778412', 'ngay_sinh' => '2007-03-24'],
            ['ho_ten' => 'Lê Công Minh', 'email' => 'congminh@gmail.com', 'sdt' => '0328778413', 'ngay_sinh' => '2009-05-18'],
            ['ho_ten' => 'Nguyễn Văn Hiếu Nghĩa', 'email' => 'hieunghia@gmail.com', 'sdt' => '0328778414', 'ngay_sinh' => '2008-07-09'],
            ['ho_ten' => 'Nguyễn Phan Minh Quân', 'email' => 'minhquan@gmail.com', 'sdt' => '0328778415', 'ngay_sinh' => '2006-09-30'],
            ['ho_ten' => 'Đỗ Ngọc Thế', 'email' => 'ngocthe@gmail.com', 'sdt' => '0328778416', 'ngay_sinh' => '2010-02-14'],
            ['ho_ten' => 'Nguyễn Lê Như Anh', 'email' => 'nhuanh@gmail.com', 'sdt' => '0328778417', 'ngay_sinh' => '2009-11-05'],
            ['ho_ten' => 'Nguyễn Hoàng Minh', 'email' => 'hoangminh@gmail.com', 'sdt' => '0328778418', 'ngay_sinh' => '2007-12-21'],
            ['ho_ten' => 'Vũ Thị Hồng Ngọc', 'email' => 'hongngoc@gmail.com', 'sdt' => '0328778419', 'ngay_sinh' => '2008-04-16'],
            ['ho_ten' => 'Nguyễn Văn Thế', 'email' => 'vanthe@gmail.com', 'sdt' => '0328778420', 'ngay_sinh' => '2010-06-28'],
        ];

        foreach ($hocViens as $hocVien) {
            DB::table('users')->updateOrInsert(
                ['email' => $hocVien['email']],
                [
                    'ho_ten' => $hocVien['ho_ten'],
                    'ngay_sinh' => $hocVien['ngay_sinh'],
                    'password' => '@Thienphu2005',
                    'sdt' => $hocVien['sdt'],
                    'vai_tro' => 'hocvien',
                    'anh_dai_dien' => null,
                    'trang_thai' => 'hoatdong',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
            );
        }
    }
}

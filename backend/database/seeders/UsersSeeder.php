<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        DB::table('users')->insert([

            [
                'ho_ten' => 'Vu Thien Phu (Admin)',
                'email' => 'vul53290@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0328778433',
                'vai_tro' => 'admin',
                'trang_thai' => 'hoatdong',
                'created_at' => $now,
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Nguyen Le Nhu Anh',
                'email' => 'nhuanh@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0912345678',
                'vai_tro' => 'hocvien',
                'trang_thai' => 'hoatdong',
                'created_at' => $now,
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Vo Tan Hien',
                'email' => 'tanhien@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0933334444',
                'vai_tro' => 'giasu',
                'trang_thai' => 'hoatdong',
                'created_at' => $now,
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Nguyen Duc Anh',
                'email' => 'nguyenducanh@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0902789456',
                'vai_tro' => 'giasu',
                'trang_thai' => 'hoatdong',
                'created_at' => $now,
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Le Thi Hong Nhung',
                'email' => 'lehongnhung@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0916543789',
                'vai_tro' => 'giasu',
                'trang_thai' => 'hoatdong',
                'created_at' => $now,
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Tran Quoc Bao',
                'email' => 'tranquocbao@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0398765432',
                'vai_tro' => 'giasu',
                'trang_thai' => 'hoatdong',
                'created_at' => $now,
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Pham Minh Tam',
                'email' => 'phamminhtam@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0876234591',
                'vai_tro' => 'giasu',
                'trang_thai' => 'hoatdong',
                'created_at' => $now,
                'updated_at' => $now
            ],

        ]);
    }
}
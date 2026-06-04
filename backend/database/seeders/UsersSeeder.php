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

        $rows = [
            [
                'ho_ten' => 'Vu Thien Phu (Admin)',
                'email' => 'vul53290@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0328778433',
                'vai_tro' => 'admin',
                'trang_thai' => 'hoatdong',
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Nguyen Le Nhu Anh',
                'email' => 'nhuanh@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0912345678',
                'vai_tro' => 'hocvien',
                'trang_thai' => 'hoatdong',
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Vo Tan Hien',
                'email' => 'tanhien@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0933334444',
                'vai_tro' => 'giasu',
                'trang_thai' => 'hoatdong',
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Nguyen Duc Anh',
                'email' => 'nguyenducanh@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0902789456',
                'vai_tro' => 'giasu',
                'trang_thai' => 'hoatdong',
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Le Thi Hong Nhung',
                'email' => 'lehongnhung@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0916543789',
                'vai_tro' => 'giasu',
                'trang_thai' => 'hoatdong',
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Tran Quoc Bao',
                'email' => 'tranquocbao@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0398765432',
                'vai_tro' => 'giasu',
                'trang_thai' => 'hoatdong',
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Pham Minh Tam',
                'email' => 'phamminhtam@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0876234591',
                'vai_tro' => 'giasu',
                'trang_thai' => 'hoatdong',
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Tran Minh Khang',
                'email' => 'minhkhang.hv@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0901122334',
                'vai_tro' => 'hocvien',
                'trang_thai' => 'hoatdong',
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Le Ngoc Mai',
                'email' => 'ngocmai.hv@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0932456781',
                'vai_tro' => 'hocvien',
                'trang_thai' => 'hoatdong',
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Pham Gia Bao',
                'email' => 'giabao.hv@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0977654321',
                'vai_tro' => 'hocvien',
                'trang_thai' => 'hoatdong',
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Nguyen Ha Linh',
                'email' => 'halinh.hv@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0988123456',
                'vai_tro' => 'hocvien',
                'trang_thai' => 'khoa',
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Vo Quang Huy',
                'email' => 'quanghuy.hv@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0911223344',
                'vai_tro' => 'hocvien',
                'trang_thai' => 'hoatdong',
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Dang Phuong Thao',
                'email' => 'phuongthao.hv@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0966789123',
                'vai_tro' => 'hocvien',
                'trang_thai' => 'hoatdong',
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Bui Anh Thu',
                'email' => 'anhthu.hv@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0944567890',
                'vai_tro' => 'hocvien',
                'trang_thai' => 'khoa',
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Hoang Duc Minh',
                'email' => 'ducminh.hv@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0888999000',
                'vai_tro' => 'hocvien',
                'trang_thai' => 'hoatdong',
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Nguyen Bao Chau',
                'email' => 'baochau.hv@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0903456789',
                'vai_tro' => 'hocvien',
                'trang_thai' => 'hoatdong',
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Tran Hoang Nam',
                'email' => 'hoangnam.hv@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0912348899',
                'vai_tro' => 'hocvien',
                'trang_thai' => 'hoatdong',
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Le Minh Anh',
                'email' => 'minhanh.hv@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0923457788',
                'vai_tro' => 'hocvien',
                'trang_thai' => 'khoa',
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Pham Thanh Truc',
                'email' => 'thanhtruc.hv@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0934566677',
                'vai_tro' => 'hocvien',
                'trang_thai' => 'hoatdong',
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Vo Khanh Vy',
                'email' => 'khanhvy.hv@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0945675566',
                'vai_tro' => 'hocvien',
                'trang_thai' => 'hoatdong',
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Dang Tuan Kiet',
                'email' => 'tuankiet.hv@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0956784455',
                'vai_tro' => 'hocvien',
                'trang_thai' => 'khoa',
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Bui Gia Han',
                'email' => 'giahan.hv@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0967893344',
                'vai_tro' => 'hocvien',
                'trang_thai' => 'hoatdong',
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Hoang Phuc An',
                'email' => 'phucan.hv@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0978902233',
                'vai_tro' => 'hocvien',
                'trang_thai' => 'hoatdong',
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Do Nhat Linh',
                'email' => 'nhatlinh.hv@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0989011122',
                'vai_tro' => 'hocvien',
                'trang_thai' => 'hoatdong',
                'updated_at' => $now
            ],

            [
                'ho_ten' => 'Huynh Minh Quan',
                'email' => 'minhquan.hv@gmail.com',
                'password' => '@Thienphu2005',
                'sdt' => '0890123456',
                'vai_tro' => 'hocvien',
                'trang_thai' => 'hoatdong',
                'updated_at' => $now
            ],

        ];

        foreach ($rows as $row) {
            DB::table('users')->updateOrInsert(
                ['email' => $row['email']],
                array_merge($row, ['created_at' => $now, 'updated_at' => $now])
            );
        }
    }
}

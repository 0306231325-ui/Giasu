<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class HocVienSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $rows = [
            [
                'email' => 'nhuanh@gmail.com',
                'lop' => 'Lớp 12',
                'truong_hoc' => 'THPT Lê Hồng Phong',
                'dia_chi' => 'Quận 1, TP.HCM',
                'ten_phu_huynh' => 'Nguyễn Văn Liêm',
                'sdt_phu_huynh' => '0999888777',
                'muc_tieu_hoc_tap' => 'Thi đậu Đại học Bách Khoa',
            ],
            [
                'email' => 'minhkhang.hv@gmail.com',
                'lop' => 'Lớp 10',
                'truong_hoc' => 'THPT Nguyễn Thị Minh Khai',
                'dia_chi' => 'Quận 3, TP.HCM',
                'ten_phu_huynh' => 'Trần Văn Hòa',
                'sdt_phu_huynh' => '0909988776',
                'muc_tieu_hoc_tap' => 'Củng cố kiến thức Toán và Vật lý lớp 10',
            ],
            [
                'email' => 'ngocmai.hv@gmail.com',
                'lop' => 'Lớp 8',
                'truong_hoc' => 'THCS Colette',
                'dia_chi' => 'Quận 3, TP.HCM',
                'ten_phu_huynh' => 'Lê Thị Hạnh',
                'sdt_phu_huynh' => '0933123456',
                'muc_tieu_hoc_tap' => 'Nâng điểm môn Tiếng Anh và luyện giao tiếp cơ bản',
            ],
            [
                'email' => 'giabao.hv@gmail.com',
                'lop' => 'Lớp 5',
                'truong_hoc' => 'Tiểu học Trần Quốc Toản',
                'dia_chi' => 'Quận Bình Thạnh, TP.HCM',
                'ten_phu_huynh' => 'Phạm Quốc Dũng',
                'sdt_phu_huynh' => '0977123987',
                'muc_tieu_hoc_tap' => 'Ôn Toán và Tiếng Việt chuẩn bị vào lớp 6',
            ],
            [
                'email' => 'halinh.hv@gmail.com',
                'lop' => 'Lớp 11',
                'truong_hoc' => 'THPT Gia Định',
                'dia_chi' => 'Quận Bình Thạnh, TP.HCM',
                'ten_phu_huynh' => 'Nguyễn Thị Thu',
                'sdt_phu_huynh' => '0988001122',
                'muc_tieu_hoc_tap' => 'Lấy lại nền tảng Hóa học và Sinh học',
            ],
            [
                'email' => 'quanghuy.hv@gmail.com',
                'lop' => 'Lớp 9',
                'truong_hoc' => 'THCS Nguyễn Du',
                'dia_chi' => 'Quận Gò Vấp, TP.HCM',
                'ten_phu_huynh' => 'Võ Minh Tâm',
                'sdt_phu_huynh' => '0911777666',
                'muc_tieu_hoc_tap' => 'Luyện thi tuyển sinh lớp 10 môn Toán',
            ],
            [
                'email' => 'phuongthao.hv@gmail.com',
                'lop' => 'Lớp 7',
                'truong_hoc' => 'THCS Lê Quý Đôn',
                'dia_chi' => 'Quận Tân Bình, TP.HCM',
                'ten_phu_huynh' => 'Đặng Thanh Sơn',
                'sdt_phu_huynh' => '0966123456',
                'muc_tieu_hoc_tap' => 'Cải thiện môn Ngữ văn và rèn kỹ năng viết',
            ],
            [
                'email' => 'anhthu.hv@gmail.com',
                'lop' => 'Lớp 6',
                'truong_hoc' => 'THCS Trần Văn Ơn',
                'dia_chi' => 'Quận 1, TP.HCM',
                'ten_phu_huynh' => 'Bùi Thị Lan',
                'sdt_phu_huynh' => '0944008899',
                'muc_tieu_hoc_tap' => 'Theo sát chương trình Toán và Tiếng Anh lớp 6',
            ],
            [
                'email' => 'ducminh.hv@gmail.com',
                'lop' => 'Lớp 12',
                'truong_hoc' => 'THPT Mạc Đĩnh Chi',
                'dia_chi' => 'Quận 6, TP.HCM',
                'ten_phu_huynh' => 'Hoàng Văn Nam',
                'sdt_phu_huynh' => '0888111222',
                'muc_tieu_hoc_tap' => 'Ôn thi tốt nghiệp THPT môn Toán và Vật lý',
            ],
            [
                'email' => 'baochau.hv@gmail.com',
                'lop' => 'Lớp 4',
                'truong_hoc' => 'Tiểu học Nguyễn Bỉnh Khiêm',
                'dia_chi' => 'Quận 1, TP.HCM',
                'ten_phu_huynh' => 'Nguyễn Thanh Bình',
                'sdt_phu_huynh' => '0903001122',
                'muc_tieu_hoc_tap' => 'Rèn Toán tư duy và đọc hiểu Tiếng Việt',
            ],
            [
                'email' => 'hoangnam.hv@gmail.com',
                'lop' => 'Lớp 10',
                'truong_hoc' => 'THPT Nguyễn Du',
                'dia_chi' => 'Quận 10, TP.HCM',
                'ten_phu_huynh' => 'Trần Hoàng Phúc',
                'sdt_phu_huynh' => '0912003344',
                'muc_tieu_hoc_tap' => 'Theo kịp chương trình Toán và Hóa lớp 10',
            ],
            [
                'email' => 'minhanh.hv@gmail.com',
                'lop' => 'Lớp 9',
                'truong_hoc' => 'THCS Hai Bà Trưng',
                'dia_chi' => 'Quận 3, TP.HCM',
                'ten_phu_huynh' => 'Lê Minh Tuấn',
                'sdt_phu_huynh' => '0923005566',
                'muc_tieu_hoc_tap' => 'Luyện thi lớp 10 môn Ngữ văn',
            ],
            [
                'email' => 'thanhtruc.hv@gmail.com',
                'lop' => 'Lớp 11',
                'truong_hoc' => 'THPT Trưng Vương',
                'dia_chi' => 'Quận 1, TP.HCM',
                'ten_phu_huynh' => 'Phạm Ngọc Hà',
                'sdt_phu_huynh' => '0934007788',
                'muc_tieu_hoc_tap' => 'Cải thiện Tiếng Anh học thuật và ngữ pháp',
            ],
            [
                'email' => 'khanhvy.hv@gmail.com',
                'lop' => 'Lớp 6',
                'truong_hoc' => 'THCS Võ Trường Toản',
                'dia_chi' => 'Quận 1, TP.HCM',
                'ten_phu_huynh' => 'Võ Hoàng Long',
                'sdt_phu_huynh' => '0945009900',
                'muc_tieu_hoc_tap' => 'Làm quen chương trình cấp 2 môn Toán',
            ],
            [
                'email' => 'tuankiet.hv@gmail.com',
                'lop' => 'Lớp 8',
                'truong_hoc' => 'THCS Nguyễn Văn Tố',
                'dia_chi' => 'Quận 10, TP.HCM',
                'ten_phu_huynh' => 'Đặng Quốc Hưng',
                'sdt_phu_huynh' => '0956001122',
                'muc_tieu_hoc_tap' => 'Lấy lại căn bản Đại số và Hình học',
            ],
            [
                'email' => 'giahan.hv@gmail.com',
                'lop' => 'Lớp 3',
                'truong_hoc' => 'Tiểu học Lương Định Của',
                'dia_chi' => 'TP. Thủ Đức, TP.HCM',
                'ten_phu_huynh' => 'Bùi Minh Huy',
                'sdt_phu_huynh' => '0967003344',
                'muc_tieu_hoc_tap' => 'Rèn nề nếp học tập và kỹ năng tính toán',
            ],
            [
                'email' => 'phucan.hv@gmail.com',
                'lop' => 'Lớp 12',
                'truong_hoc' => 'THPT Nguyễn Hữu Huân',
                'dia_chi' => 'TP. Thủ Đức, TP.HCM',
                'ten_phu_huynh' => 'Hoàng Văn Phúc',
                'sdt_phu_huynh' => '0978005566',
                'muc_tieu_hoc_tap' => 'Ôn thi tốt nghiệp THPT môn Hóa học',
            ],
            [
                'email' => 'nhatlinh.hv@gmail.com',
                'lop' => 'Lớp 7',
                'truong_hoc' => 'THCS Phan Sào Nam',
                'dia_chi' => 'Quận 3, TP.HCM',
                'ten_phu_huynh' => 'Đỗ Thị Hương',
                'sdt_phu_huynh' => '0989007788',
                'muc_tieu_hoc_tap' => 'Củng cố kiến thức Sinh học và Tiếng Anh',
            ],
            [
                'email' => 'minhquan.hv@gmail.com',
                'lop' => 'Lớp 5',
                'truong_hoc' => 'Tiểu học Đinh Tiên Hoàng',
                'dia_chi' => 'Quận Bình Thạnh, TP.HCM',
                'ten_phu_huynh' => 'Huỳnh Anh Tuấn',
                'sdt_phu_huynh' => '0890009900',
                'muc_tieu_hoc_tap' => 'Chuẩn bị kiến thức nền cho chương trình lớp 6',
            ],
        ];

        foreach ($rows as $row) {
            $userId = DB::table('users')
                ->where('email', $row['email'])
                ->where('vai_tro', 'hocvien')
                ->value('id');

            if (! $userId) {
                continue;
            }

            unset($row['email']);

            DB::table('hocvien')->updateOrInsert(
                ['user_id' => $userId],
                array_merge($row, [
                    'user_id' => $userId,
                    'created_at' => $now,
                    'updated_at' => $now,
                ])
            );
        }
    }
}

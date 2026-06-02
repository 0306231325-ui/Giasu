<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class GiaSuSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $rows = [
            [
                'user_id' => 3,
                'mo_ta' => 'Gia sư nhiệt tình, tận tâm.',
                'kinh_nghiem' => '3 năm dạy kèm',
                'hoc_van' => 'Đại học Sư Phạm TP.HCM',
                'trang_thai_ho_so' => 'duyet',
                'dia_chi' => 'Quận 5, TP.HCM',
            ],
            [
                'user_id' => 4,
                'mo_ta' => 'Chuyên luyện thi THPT Quốc gia môn Toán và Lý.',
                'kinh_nghiem' => '5 năm dạy kèm cấp 2, cấp 3',
                'hoc_van' => 'Đại học Bách Khoa TP.HCM',
                'trang_thai_ho_so' => 'duyet',
                'dia_chi' => 'Quận 10, TP.HCM',
            ],
            [
                'user_id' => 5,
                'mo_ta' => 'Dạy Tiếng Anh giao tiếp và luyện thi IELTS.',
                'kinh_nghiem' => '4 năm, IELTS 7.5',
                'hoc_van' => 'Đại học Sư Phạm Ngoại ngữ TP.HCM',
                'trang_thai_ho_so' => 'duyet',
                'dia_chi' => 'Quận 3, TP.HCM',
            ],
            [
                'user_id' => 6,
                'mo_ta' => 'Phương pháp dạy Vật Lý trực quan, dễ hiểu.',
                'kinh_nghiem' => '6 năm dạy Lý THCS, THPT',
                'hoc_van' => 'Thạc sĩ Vật Lý - ĐH Khoa học Tự nhiên',
                'trang_thai_ho_so' => 'duyet',
                'dia_chi' => 'Thủ Đức, TP.HCM',
            ],
            [
                'user_id' => 7,
                'mo_ta' => 'Kèm Toán từ lớp 6 đến lớp 12, kiên nhẫn với học sinh yếu.',
                'kinh_nghiem' => '2 năm dạy kèm tại nhà',
                'hoc_van' => 'Đại học Khoa học Xã hội và Nhân văn',
                'trang_thai_ho_so' => 'duyet',
                'dia_chi' => 'Gò Vấp, TP.HCM',
            ],
        ];

        foreach ($rows as $row) {
            DB::table('giasu')->updateOrInsert(
                ['user_id' => $row['user_id']],
                array_merge($row, ['created_at' => $now, 'updated_at' => $now])
            );
        }
    }
}

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
        $trinhDoIds = DB::table('trinh_do_giasu')->pluck('id', 'ma');
        $mucKinhNghiemIds = DB::table('muc_kinh_nghiem')->pluck('id', 'tu_khoang');

        $rows = [
            [
                'user_id' => 3,
                'trinh_do' => 'sinh_vien',
                'cap_hoc' => ['thpt'],
                'mo_ta' => 'Gia sư nhiệt tình, tận tâm.',
                'kinh_nghiem' => '3 năm dạy kèm',
                'muc_kinh_nghiem_tu' => 3,
                'hoc_van' => 'Đại học Sư Phạm TP.HCM',
                'truong_hoc' => 'Đại học Sư Phạm TP.HCM',
                'trang_thai_ho_so' => 'duyet',
                'dia_chi' => 'Quận 5, TP.HCM',
            ],
            [
                'user_id' => 4,
                'trinh_do' => 'gia_su_tu_do',
                'cap_hoc' => ['thcs', 'thpt'],
                'mo_ta' => 'Chuyên luyện thi THPT Quốc gia môn Toán và Lý.',
                'kinh_nghiem' => '5 năm dạy kèm cấp 2, cấp 3',
                'muc_kinh_nghiem_tu' => 3,
                'hoc_van' => 'Đại học Bách Khoa TP.HCM',
                'truong_hoc' => 'Đại học Bách Khoa TP.HCM',
                'trang_thai_ho_so' => 'duyet',
                'dia_chi' => 'Quận 10, TP.HCM',
            ],
            [
                'user_id' => 5,
                'trinh_do' => 'giao_vien_dang_day',
                'cap_hoc' => ['thcs', 'thpt'],
                'mo_ta' => 'Dạy Tiếng Anh giao tiếp và luyện thi IELTS.',
                'kinh_nghiem' => '4 năm, IELTS 7.5',
                'muc_kinh_nghiem_tu' => 3,
                'hoc_van' => 'Đại học Sư Phạm Ngoại ngữ TP.HCM',
                'truong_hoc' => 'Đại học Sư Phạm TP.HCM',
                'trang_thai_ho_so' => 'duyet',
                'dia_chi' => 'Quận 3, TP.HCM',
            ],
            [
                'user_id' => 6,
                'trinh_do' => 'thac_si',
                'cap_hoc' => ['thpt', 'dai_hoc'],
                'mo_ta' => 'Phương pháp dạy Vật Lý trực quan, dễ hiểu.',
                'kinh_nghiem' => '6 năm dạy Lý THCS, THPT',
                'muc_kinh_nghiem_tu' => 6,
                'hoc_van' => 'Thạc sĩ Vật Lý - ĐH Khoa học Tự nhiên',
                'truong_hoc' => 'Đại học Khoa học Tự nhiên TP.HCM',
                'trang_thai_ho_so' => 'duyet',
                'dia_chi' => 'Thủ Đức, TP.HCM',
            ],
            [
                'user_id' => 7,
                'trinh_do' => 'gia_su_tu_do',
                'cap_hoc' => ['thcs', 'thpt'],
                'mo_ta' => 'Kèm Toán từ lớp 6 đến lớp 12, kiên nhẫn với học sinh yếu.',
                'kinh_nghiem' => '2 năm dạy kèm tại nhà',
                'muc_kinh_nghiem_tu' => 1,
                'hoc_van' => 'Đại học Khoa học Xã hội và Nhân văn',
                'truong_hoc' => 'Đại học Khoa học Xã hội và Nhân văn TP.HCM',
                'trang_thai_ho_so' => 'duyet',
                'dia_chi' => 'Gò Vấp, TP.HCM',
            ],
        ];

        foreach ($rows as $row) {
            $capHocMa = $row['cap_hoc'][0] ?? null;
            $trinhDoMa = $row['trinh_do'];
            $mucKinhNghiemTu = $row['muc_kinh_nghiem_tu'];
            unset($row['cap_hoc'], $row['trinh_do'], $row['muc_kinh_nghiem_tu']);

            $capHocId = $capHocMa
                ? DB::table('cap_hoc')->where('ma', $capHocMa)->value('id')
                : null;

            DB::table('giasu')->updateOrInsert(
                ['user_id' => $row['user_id']],
                array_merge($row, [
                    'cap_hoc_id' => $capHocId,
                    'trinh_do_giasu_id' => $trinhDoIds[$trinhDoMa] ?? null,
                    'muc_kinh_nghiem_id' => $mucKinhNghiemIds[$mucKinhNghiemTu] ?? null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ])
            );
        }
    }
}

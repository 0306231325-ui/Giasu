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

        $rows = [
            [
                'user_id' => 3,
                'trinh_do' => 'sinh_vien',
                'cap_hoc' => ['thpt'],
                'mo_ta' => 'Gia sư nhiệt tình, tận tâm.',
                'kinh_nghiem' => '3 năm dạy kèm',
                'hoc_van' => 'Đại học Sư Phạm TP.HCM',
                'trang_thai_ho_so' => 'duyet',
                'dia_chi' => 'Quận 5, TP.HCM',
            ],
            [
                'user_id' => 4,
                'trinh_do' => 'gia_su_tu_do',
                'cap_hoc' => ['thcs', 'thpt'],
                'mo_ta' => 'Chuyên luyện thi THPT Quốc gia môn Toán và Lý.',
                'kinh_nghiem' => '5 năm dạy kèm cấp 2, cấp 3',
                'hoc_van' => 'Đại học Bách Khoa TP.HCM',
                'trang_thai_ho_so' => 'duyet',
                'dia_chi' => 'Quận 10, TP.HCM',
            ],
            [
                'user_id' => 5,
                'trinh_do' => 'giao_vien_dang_day',
                'cap_hoc' => ['thcs', 'thpt'],
                'mo_ta' => 'Dạy Tiếng Anh giao tiếp và luyện thi IELTS.',
                'kinh_nghiem' => '4 năm, IELTS 7.5',
                'hoc_van' => 'Đại học Sư Phạm Ngoại ngữ TP.HCM',
                'trang_thai_ho_so' => 'duyet',
                'dia_chi' => 'Quận 3, TP.HCM',
            ],
            [
                'user_id' => 6,
                'trinh_do' => 'thac_si',
                'cap_hoc' => ['thpt', 'dai_hoc'],
                'mo_ta' => 'Phương pháp dạy Vật Lý trực quan, dễ hiểu.',
                'kinh_nghiem' => '6 năm dạy Lý THCS, THPT',
                'hoc_van' => 'Thạc sĩ Vật Lý - ĐH Khoa học Tự nhiên',
                'trang_thai_ho_so' => 'duyet',
                'dia_chi' => 'Thủ Đức, TP.HCM',
            ],
            [
                'user_id' => 7,
                'trinh_do' => 'gia_su_tu_do',
                'cap_hoc' => ['thcs', 'thpt'],
                'mo_ta' => 'Kèm Toán từ lớp 6 đến lớp 12, kiên nhẫn với học sinh yếu.',
                'kinh_nghiem' => '2 năm dạy kèm tại nhà',
                'hoc_van' => 'Đại học Khoa học Xã hội và Nhân văn',
                'trang_thai_ho_so' => 'duyet',
                'dia_chi' => 'Gò Vấp, TP.HCM',
            ],
        ];

        foreach ($rows as $row) {
            $capHocMas = $row['cap_hoc'];
            $trinhDoMa = $row['trinh_do'];
            unset($row['cap_hoc'], $row['trinh_do']);

            DB::table('giasu')->updateOrInsert(
                ['user_id' => $row['user_id']],
                array_merge($row, [
                    'trinh_do_giasu_id' => $trinhDoIds[$trinhDoMa] ?? null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ])
            );

            $giasuId = DB::table('giasu')->where('user_id', $row['user_id'])->value('id');
            if (! $giasuId) {
                continue;
            }

            foreach ($capHocMas as $ma) {
                $capHocId = DB::table('cap_hoc')->where('ma', $ma)->value('id');
                if (! $capHocId) {
                    continue;
                }

                DB::table('giasu_cap_hoc')->updateOrInsert(
                    ['giasu_id' => $giasuId, 'cap_hoc_id' => $capHocId],
                    [
                        'giasu_id' => $giasuId,
                        'cap_hoc_id' => $capHocId,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]
                );
            }
        }
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TrinhDoGiasuSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $rows = [
            ['ma' => 'sinh_vien', 'ten' => 'Sinh viên', 'gia_cong_them' => 0, 'thu_tu' => 1],
            ['ma' => 'gia_su_tu_do', 'ten' => 'Gia sư tự do', 'gia_cong_them' => 50000, 'thu_tu' => 2],
            ['ma' => 'giao_vien_dang_day', 'ten' => 'Giáo viên đang đứng lớp', 'gia_cong_them' => 120000, 'thu_tu' => 3],
            ['ma' => 'giang_vien_cao_dang', 'ten' => 'Giảng viên cao đẳng', 'gia_cong_them' => 180000, 'thu_tu' => 4],
            ['ma' => 'giang_vien_dai_hoc', 'ten' => 'Giảng viên đại học', 'gia_cong_them' => 220000, 'thu_tu' => 5],
            ['ma' => 'thac_si', 'ten' => 'Thạc sĩ', 'gia_cong_them' => 250000, 'thu_tu' => 6],
            ['ma' => 'tien_si', 'ten' => 'Tiến sĩ', 'gia_cong_them' => 350000, 'thu_tu' => 7],
        ];

        foreach ($rows as $row) {
            DB::table('trinh_do_giasu')->updateOrInsert(
                ['ma' => $row['ma']],
                array_merge($row, ['created_at' => $now, 'updated_at' => $now])
            );
        }
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CapHocSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $rows = [
            ['ma' => 'tieu_hoc', 'ten' => 'Tiểu học', 'thu_tu' => 1],
            ['ma' => 'thcs', 'ten' => 'THCS', 'thu_tu' => 2],
            ['ma' => 'thpt', 'ten' => 'THPT', 'thu_tu' => 3],
            ['ma' => 'cao_dang', 'ten' => 'Cao đẳng', 'thu_tu' => 4],
            ['ma' => 'dai_hoc', 'ten' => 'Đại học', 'thu_tu' => 5],
        ];

        foreach ($rows as $row) {
            DB::table('cap_hoc')->updateOrInsert(
                ['ma' => $row['ma']],
                array_merge($row, ['created_at' => $now, 'updated_at' => $now])
            );
        }
    }
}

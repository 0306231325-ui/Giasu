<?php

namespace Database\Seeders;

use App\Services\GiaTinhService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class GiaSuGiaSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $assignments = [
            ['giasu_id' => 1, 'ten_mon' => 'Toán Học', 'cap' => 'thpt', 'lops' => [10, 11, 12]],
            ['giasu_id' => 1, 'ten_mon' => 'Vật Lý', 'cap' => 'thpt', 'lops' => [10, 11, 12]],
            ['giasu_id' => 2, 'ten_mon' => 'Toán Học', 'cap' => 'thpt', 'lops' => [10, 11, 12]],
            ['giasu_id' => 2, 'ten_mon' => 'Vật Lý', 'cap' => 'thpt', 'lops' => [10, 11, 12]],
            ['giasu_id' => 3, 'ten_mon' => 'Tiếng Anh', 'cap' => 'thpt', 'lops' => [10, 11, 12]],
            ['giasu_id' => 4, 'ten_mon' => 'Vật Lý', 'cap' => 'thpt', 'lops' => [10, 11, 12]],
            ['giasu_id' => 5, 'ten_mon' => 'Toán Học', 'cap' => 'thcs', 'lops' => [6, 7, 8, 9]],
            ['giasu_id' => 5, 'ten_mon' => 'Toán Học', 'cap' => 'thpt', 'lops' => [10, 11, 12]],
        ];

        foreach ($assignments as $item) {
            $capHocId = DB::table('cap_hoc')->where('ma', $item['cap'])->value('id');
            if (! $capHocId) {
                continue;
            }

            foreach ($item['lops'] as $soLop) {
                $monhocId = DB::table('monhoc')
                    ->where('ten_mon', $item['ten_mon'])
                    ->where('cap_hoc_id', $capHocId)
                    ->where('so_lop', $soLop)
                    ->value('id');

                if (! $monhocId) {
                    continue;
                }

                $gia = GiaTinhService::tinhGiaGiasu($monhocId, $item['giasu_id']);
                if (! $gia) {
                    continue;
                }

                DB::table('giasu_gia')->updateOrInsert(
                    ['giasu_id' => $item['giasu_id'], 'monhoc_id' => $monhocId],
                    array_merge($gia, [
                        'created_at' => $now,
                        'updated_at' => $now,
                    ])
                );
            }
        }
    }
}

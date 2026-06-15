<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MonHocSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();
        $cacCapHoc = [
            'tieu_hoc' => range(1, 5),
            'thcs' => range(6, 9),
            'thpt' => range(10, 12),
        ];

        $monTheoCap = [
            'tieu_hoc' => [
                'Toán Học' => 100000,
                'Tiếng Việt' => 100000,
                'Tiếng Anh' => 140000,
            ],
            'thcs' => [
                'Toán Học' => 180000,
                'Ngữ Văn' => 170000,
                'Vật Lý' => 190000,
                'Hóa Học' => 190000,
                'Tiếng Anh' => 200000,
            ],
            'thpt' => [
                'Toán Học' => 280000,
                'Ngữ Văn' => 250000,
                'Vật Lý' => 300000,
                'Hóa Học' => 300000,
                'Sinh Học' => 280000,
                'Tiếng Anh' => 320000,
            ],
        ];

        foreach ($monTheoCap as $maCap => $cacMon) {
            $capHocId = DB::table('cap_hoc')->where('ma', $maCap)->value('id');
            if (! $capHocId) {
                continue;
            }

            DB::table('monhoc')
                ->where('cap_hoc_id', $capHocId)
                ->whereNotIn('ten_mon', array_keys($cacMon))
                ->whereNotExists(function ($query) {
                    $query->selectRaw('1')
                        ->from('giasu_gia')
                        ->whereColumn('giasu_gia.monhoc_id', 'monhoc.id');
                })
                ->whereNotExists(function ($query) {
                    $query->selectRaw('1')
                        ->from('goihoc')
                        ->whereColumn('goihoc.monhoc_id', 'monhoc.id');
                })
                ->delete();
        }

        foreach ($cacCapHoc as $maCap => $cacLop) {
            $cap = DB::table('cap_hoc')->where('ma', $maCap)->first();
            if (! $cap) {
                continue;
            }

            foreach ($monTheoCap[$maCap] as $tenMon => $giaGoc) {
                foreach ($cacLop as $soLop) {
                    $lop = 'Lớp ' . $soLop;
                    $gia = $giaGoc;

                    DB::table('monhoc')->updateOrInsert(
                        [
                            'cap_hoc_id' => $cap->id,
                            'ten_mon' => $tenMon,
                            'lop' => $lop,
                        ],
                        [
                            'gia' => $gia,
                            'mo_ta' => $tenMon . ' ' . $lop . ' - ' . $cap->ten,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]
                    );
                }
            }
        }
    }
}

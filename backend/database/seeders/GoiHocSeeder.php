<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class GoiHocSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $capThptId = DB::table('cap_hoc')->where('ma', 'thpt')->value('id');
        $monhocId = DB::table('monhoc')
            ->where('ten_mon', 'Toán Học')
            ->where('cap_hoc_id', $capThptId)
            ->where('so_lop', 10)
            ->value('id');

        $donGia = DB::table('giasu_gia')
            ->where('giasu_id', 1)
            ->where('monhoc_id', $monhocId)
            ->value('tong_gia');

        $exists = DB::table('goihoc')
            ->where('hocvien_id', 2)
            ->where('giasu_id', 1)
            ->where('monhoc_id', $monhocId)
            ->exists();

        if ($exists || ! $monhocId) {
            return;
        }

        $goiHocId = DB::table('goihoc')->insertGetId([
            'hocvien_id' => 2,
            'giasu_id' => 1,
            'monhoc_id' => $monhocId,
            'ngay_batdau' => $now->copy()->addDays(1)->toDateString(),
            'ngay_ketthuc' => $now->copy()->addDays(30)->toDateString(),
            'so_buoi' => 12,
            'hoc_dinhky' => true,
            'dia_chi_hoc' => '12 Nguyễn Văn Cừ, Quận 5, TP.HCM',
            'hinh_thuc_hoc' => 'offline',
            'tong_tien' => 1800000.00,
            'don_gia_theogio' => $donGia,
            'trang_thai' => 'danghoc',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        foreach ([2, 6] as $thu) {
            DB::table('goihoc_lich_dinhky')->updateOrInsert(
                [
                    'goihoc_id' => $goiHocId,
                    'thu' => $thu,
                    'gio_batdau' => $thu === 2 ? '18:00:00' : '14:00:00',
                    'gio_ketthuc' => $thu === 2 ? '20:00:00' : '16:00:00',
                ],
                [
                    'goihoc_id' => $goiHocId,
                    'thu' => $thu,
                    'gio_batdau' => $thu === 2 ? '18:00:00' : '14:00:00',
                    'gio_ketthuc' => $thu === 2 ? '20:00:00' : '16:00:00',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
    }
}

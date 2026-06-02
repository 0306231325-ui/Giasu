<?php

namespace Database\Seeders;

use App\Services\GiaTinhService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class GoiHocSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();
        $lopId = DB::table('lop')->where('so_lop', 10)->value('id');
        $donGia = $lopId ? GiaTinhService::tinhGiaChuan(1, $lopId) : null;

        $giasuGiaId = null;
        if ($lopId) {
            $giasuGiaId = DB::table('giasu_gia')
                ->where('giasu_id', 1)
                ->where('monhoc_id', 1)
                ->where('lop_id', $lopId)
                ->value('id');
        }

        $exists = DB::table('goihoc')
            ->where('hocvien_id', 2)
            ->where('giasu_id', 1)
            ->where('monhoc_id', 1)
            ->exists();

        if ($exists) {
            return;
        }

        DB::table('goihoc')->insert([
            'hocvien_id' => 2,
            'giasu_id' => 1,
            'monhoc_id' => 1,
            'lop_id' => $lopId,
            'ngay_batdau' => $now->copy()->addDays(1)->toDateString(),
            'ngay_ketthuc' => $now->copy()->addDays(30)->toDateString(),
            'so_buoi' => 12,
            'hoc_dinhky' => 1,
            'tong_tien' => 1800000.00,
            'don_gia_theogio' => $donGia,
            'giasu_gia_id' => $giasuGiaId,
            'trang_thai' => 'danghoc',
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }
}

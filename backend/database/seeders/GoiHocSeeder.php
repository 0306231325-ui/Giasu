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
            ->where('lop', 'Lớp 10')
            ->value('id');

        $giaGiasu = DB::table('giasu_gia')
            ->where('giasu_id', 1)
            ->where('monhoc_id', $monhocId)
            ->first(['id', 'tong_gia']);
        $donGia = $giaGiasu?->tong_gia;
        $soBuoi = 12;
        $soThang = 1;
        $loaiGoiId = DB::table('loai_goi')
            ->where('so_thang', '<=', $soThang)
            ->orderByDesc('so_thang')
            ->value('id');

        $exists = DB::table('goihoc')
            ->where('hocvien_id', 2)
            ->where('giasu_id', 1)
            ->where('monhoc_id', $monhocId)
            ->exists();

        if ($exists || ! $monhocId) {
            return;
        }

        DB::table('goihoc')->insert([
            'hocvien_id' => 2,
            'giasu_id' => 1,
            'monhoc_id' => $monhocId,
            'giasu_gia_id' => $giaGiasu?->id,
            'loai_goi_id' => $loaiGoiId,
            'ngay_batdau' => $now->copy()->addDays(1)->toDateString(),
            'ngay_ketthuc' => $now->copy()->addDays(30)->toDateString(),
            'so_buoi' => $soBuoi,
            'hoc_dinhky' => true,
            'thu' => 2,
            'gio_batdau' => '18:00:00',
            'gio_ketthuc' => '20:00:00',
            'dia_chi_hoc' => '12 Nguyễn Văn Cừ, Quận 5, TP.HCM',
            'hinh_thuc_hoc' => 'offline',
            'tong_tien' => 1800000.00,
            'don_gia_theogio' => $donGia,
            'trang_thai' => 'danghoc',
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }
}

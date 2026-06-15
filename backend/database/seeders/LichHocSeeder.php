<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LichHocSeeder extends Seeder
{
    public function run(): void
    {
        $goiHocId = DB::table('goihoc')
            ->where('hocvien_id', 2)
            ->where('giasu_id', 1)
            ->value('id');

        if (! $goiHocId) {
            return;
        }

        $exists = DB::table('lichhoc')->where('goihoc_id', $goiHocId)->exists();
        if ($exists) {
            return;
        }

        $now = Carbon::now();
        $phanTramGiam = DB::table('goihoc')
            ->leftJoin('chietkhau', 'chietkhau.id', '=', 'goihoc.chietkhau_id')
            ->where('goihoc.id', $goiHocId)
            ->value('chietkhau.phan_tram_giam') ?? 0;
        $tienHocGoc = 300000.00;
        $tienHocSauGiam = $tienHocGoc * (1 - ((float) $phanTramGiam / 100));

        DB::table('lichhoc')->insert([
            'goihoc_id' => $goiHocId,
            'loai_buoi' => 'hoc_thuong',
            'ngay_hoc' => $now->copy()->addDays(2)->toDateString(),
            'gio_batdau' => '18:00:00',
            'gio_ketthuc' => '20:00:00',
            'dia_chi_hoc' => '12 Nguyễn Văn Cừ, Quận 5, TP.HCM',
            'hinh_thuc_hoc' => 'offline',
            'tien_hoc' => $tienHocSauGiam,
            'da_giam' => $phanTramGiam,
            'phi_hoahong' => 30000.00,
            'tien_giasu_nhan' => 270000.00,
            'trang_thai' => 'da_nhan',
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }
}

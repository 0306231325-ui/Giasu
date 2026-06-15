<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ThanhToanSeeder extends Seeder
{
    public function run(): void
    {
        $goiHocId = DB::table('goihoc')->orderBy('id')->value('id');
        if (! $goiHocId || DB::table('thanhtoan')->where('goihoc_id', $goiHocId)->exists()) {
            return;
        }

        $now = Carbon::now();

        DB::table('thanhtoan')->insert([
            'goihoc_id' => $goiHocId,
            'so_tien' => 1800000.00,
            'phuong_thuc' => 'banking',
            'so_tai_khoan' => '0123456789',
            'ma_giaodich' => 'VN123456789',
            'ngay_thanhtoan' => $now,
            'trang_thai' => 'da_thanhtoan',
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }
}

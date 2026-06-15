<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DanhGiaSeeder extends Seeder
{
    public function run(): void
    {
        $lichHocId = DB::table('lichhoc')->orderBy('id')->value('id');
        if (! $lichHocId || DB::table('danhgia')->where('lichhoc_id', $lichHocId)->exists()) {
            return;
        }

        $now = Carbon::now();
        $userId = DB::table('lichhoc')
            ->join('goihoc', 'goihoc.id', '=', 'lichhoc.goihoc_id')
            ->where('lichhoc.id', $lichHocId)
            ->value('goihoc.hocvien_id');

        DB::table('danhgia')->insert([
            'lichhoc_id' => $lichHocId,
            'user_id' => $userId,
            'so_sao' => 5,
            'noi_dung' => 'Dạy rất dễ hiểu!',
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }
}

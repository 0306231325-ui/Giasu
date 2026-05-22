<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LichRanhSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();
        DB::table('lichranh')->insert([
            ['giasu_id' => 1, 'thu' => 2, 'gio_batdau' => '18:00:00', 'gio_ketthuc' => '20:00:00', 'trang_thai' => 'ranh', 'created_at' => $now, 'updated_at' => $now],
            ['giasu_id' => 1, 'thu' => 4, 'gio_batdau' => '18:00:00', 'gio_ketthuc' => '20:00:00', 'trang_thai' => 'ranh', 'created_at' => $now, 'updated_at' => $now],
        ]);
    }
}
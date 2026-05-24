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
            ['giasu_id' => 2, 'thu' => 3, 'gio_batdau' => '19:00:00', 'gio_ketthuc' => '21:00:00', 'trang_thai' => 'ranh', 'created_at' => $now, 'updated_at' => $now],
            ['giasu_id' => 2, 'thu' => 6, 'gio_batdau' => '08:00:00', 'gio_ketthuc' => '10:00:00', 'trang_thai' => 'ranh', 'created_at' => $now, 'updated_at' => $now],
            ['giasu_id' => 3, 'thu' => 2, 'gio_batdau' => '17:00:00', 'gio_ketthuc' => '19:00:00', 'trang_thai' => 'ranh', 'created_at' => $now, 'updated_at' => $now],
            ['giasu_id' => 3, 'thu' => 5, 'gio_batdau' => '17:00:00', 'gio_ketthuc' => '19:00:00', 'trang_thai' => 'ranh', 'created_at' => $now, 'updated_at' => $now],
            ['giasu_id' => 4, 'thu' => 4, 'gio_batdau' => '18:30:00', 'gio_ketthuc' => '20:30:00', 'trang_thai' => 'ranh', 'created_at' => $now, 'updated_at' => $now],
            ['giasu_id' => 4, 'thu' => 7, 'gio_batdau' => '14:00:00', 'gio_ketthuc' => '16:00:00', 'trang_thai' => 'ranh', 'created_at' => $now, 'updated_at' => $now],
            ['giasu_id' => 5, 'thu' => 3, 'gio_batdau' => '18:00:00', 'gio_ketthuc' => '20:00:00', 'trang_thai' => 'ranh', 'created_at' => $now, 'updated_at' => $now],
            ['giasu_id' => 5, 'thu' => 5, 'gio_batdau' => '19:00:00', 'gio_ketthuc' => '21:00:00', 'trang_thai' => 'ranh', 'created_at' => $now, 'updated_at' => $now],
        ]);
    }
}

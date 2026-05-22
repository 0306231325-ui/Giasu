<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GiaSuMonHocSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('giasu_monhoc')->insert([
            ['giasu_id' => 1, 'monhoc_id' => 1],
            ['giasu_id' => 1, 'monhoc_id' => 2],
        ]);
    }
}
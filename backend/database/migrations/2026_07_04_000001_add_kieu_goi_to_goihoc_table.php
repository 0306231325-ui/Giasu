<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('goihoc', function (Blueprint $table) {
            if (! Schema::hasColumn('goihoc', 'kieu_goi')) {
                $table->enum('kieu_goi', ['hoc_thu', 'dinh_ky', 'khong_dinh_ky'])
                    ->default('dinh_ky')
                    ->after('hoc_dinhky');
            }
        });

        DB::table('goihoc')
            ->where('hoc_dinhky', true)
            ->update(['kieu_goi' => 'dinh_ky']);

        DB::table('goihoc')
            ->where('hoc_dinhky', false)
            ->where('so_buoi', 1)
            ->update(['kieu_goi' => 'hoc_thu']);

        DB::table('goihoc')
            ->where('hoc_dinhky', false)
            ->where('so_buoi', '>', 1)
            ->update(['kieu_goi' => 'khong_dinh_ky']);
    }

    public function down(): void
    {
        Schema::table('goihoc', function (Blueprint $table) {
            if (Schema::hasColumn('goihoc', 'kieu_goi')) {
                $table->dropColumn('kieu_goi');
            }
        });
    }
};

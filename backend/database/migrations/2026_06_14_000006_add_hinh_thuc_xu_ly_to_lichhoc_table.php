<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lichhoc', function (Blueprint $table) {
            $table->enum('hinh_thuc_xu_ly', ['hoc_bu', 'khong_tinh_phi'])
                ->nullable()
                ->after('thoigian_huy');
        });
    }

    public function down(): void
    {
        Schema::table('lichhoc', function (Blueprint $table) {
            $table->dropColumn('hinh_thuc_xu_ly');
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('giasu', function (Blueprint $table) {
            $table->dropColumn('tong_danhgia');
        });
    }

    public function down(): void
    {
        Schema::table('giasu', function (Blueprint $table) {
            $table->float('tong_danhgia')->default(0);
        });
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bang_gia', function (Blueprint $table) {
            $table->decimal('gia_min', 10, 2)->nullable()->after('gia_mac_dinh');
            $table->decimal('gia_max', 10, 2)->nullable()->after('gia_min');
        });
    }

    public function down(): void
    {
        Schema::table('bang_gia', function (Blueprint $table) {
            $table->dropColumn(['gia_min', 'gia_max']);
        });
    }
};


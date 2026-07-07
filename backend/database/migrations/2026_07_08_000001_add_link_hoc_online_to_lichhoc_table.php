<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lichhoc', function (Blueprint $table) {
            $table->string('link_hoc_online', 500)->nullable()->after('hinh_thuc_hoc');
        });
    }

    public function down(): void
    {
        Schema::table('lichhoc', function (Blueprint $table) {
            $table->dropColumn('link_hoc_online');
        });
    }
};

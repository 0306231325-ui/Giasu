<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('thongbao', function (Blueprint $table) {
            if (! Schema::hasColumn('thongbao', 'url')) {
                $table->string('url')->nullable()->after('noi_dung');
            }
        });
    }

    public function down(): void
    {
        Schema::table('thongbao', function (Blueprint $table) {
            if (Schema::hasColumn('thongbao', 'url')) {
                $table->dropColumn('url');
            }
        });
    }
};

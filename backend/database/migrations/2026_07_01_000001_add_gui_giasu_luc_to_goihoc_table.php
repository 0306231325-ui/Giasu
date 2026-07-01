<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('goihoc', function (Blueprint $table) {
            if (! Schema::hasColumn('goihoc', 'gui_giasu_luc')) {
                $table->timestamp('gui_giasu_luc')->nullable()->after('trang_thai');
            }
        });
    }

    public function down(): void
    {
        Schema::table('goihoc', function (Blueprint $table) {
            if (Schema::hasColumn('goihoc', 'gui_giasu_luc')) {
                $table->dropColumn('gui_giasu_luc');
            }
        });
    }
};

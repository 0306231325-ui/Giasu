<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('yeucau_hocbu', function (Blueprint $table) {
            if (Schema::hasColumn('yeucau_hocbu', 'gio_ketthuc_cu')) {
                $table->dropColumn('gio_ketthuc_cu');
            }

            if (Schema::hasColumn('yeucau_hocbu', 'gio_batdau_cu')) {
                $table->dropColumn('gio_batdau_cu');
            }

            if (Schema::hasColumn('yeucau_hocbu', 'ngay_hoc_cu')) {
                $table->dropColumn('ngay_hoc_cu');
            }
        });
    }

    public function down(): void
    {
        Schema::table('yeucau_hocbu', function (Blueprint $table) {
            if (! Schema::hasColumn('yeucau_hocbu', 'ngay_hoc_cu')) {
                $table->date('ngay_hoc_cu')->nullable()->after('ngay_yeu_cau');
            }

            if (! Schema::hasColumn('yeucau_hocbu', 'gio_batdau_cu')) {
                $table->time('gio_batdau_cu')->nullable()->after('ngay_hoc_cu');
            }

            if (! Schema::hasColumn('yeucau_hocbu', 'gio_ketthuc_cu')) {
                $table->time('gio_ketthuc_cu')->nullable()->after('gio_batdau_cu');
            }
        });
    }
};

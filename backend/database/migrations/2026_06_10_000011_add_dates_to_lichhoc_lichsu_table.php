<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('lichhoc_lichsu')) {
            return;
        }

        if (! Schema::hasColumn('lichhoc_lichsu', 'ngay_tao')) {
            Schema::table('lichhoc_lichsu', function (Blueprint $table) {
                $table->date('ngay_tao')->nullable()->after('trang_thai_moi');
            });
        }

        if (! Schema::hasColumn('lichhoc_lichsu', 'ngay_ap_dung')) {
            Schema::table('lichhoc_lichsu', function (Blueprint $table) {
                $table->date('ngay_ap_dung')->nullable()->after('ngay_tao');
            });
        }

        if (Schema::hasColumn('lichhoc_lichsu', 'created_at')) {
            DB::statement('UPDATE `lichhoc_lichsu` SET `ngay_tao` = DATE(`created_at`) WHERE `ngay_tao` IS NULL AND `created_at` IS NOT NULL');
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('lichhoc_lichsu')) {
            return;
        }

        foreach (['ngay_ap_dung', 'ngay_tao'] as $column) {
            if (Schema::hasColumn('lichhoc_lichsu', $column)) {
                Schema::table('lichhoc_lichsu', function (Blueprint $table) use ($column) {
                    $table->dropColumn($column);
                });
            }
        }
    }
};

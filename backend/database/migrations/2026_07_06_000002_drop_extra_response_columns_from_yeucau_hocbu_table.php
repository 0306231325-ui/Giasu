<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('yeucau_hocbu', function (Blueprint $table) {
            if (Schema::hasColumn('yeucau_hocbu', 'gia_su_phan_hoi_luc')) {
                $table->dropColumn('gia_su_phan_hoi_luc');
            }

            if (Schema::hasColumn('yeucau_hocbu', 'ly_do_gia_su')) {
                $table->dropColumn('ly_do_gia_su');
            }

            if (Schema::hasColumn('yeucau_hocbu', 'ghi_chu_admin')) {
                $table->dropColumn('ghi_chu_admin');
            }
        });
    }

    public function down(): void
    {
        Schema::table('yeucau_hocbu', function (Blueprint $table) {
            if (! Schema::hasColumn('yeucau_hocbu', 'gia_su_phan_hoi_luc')) {
                $table->dateTime('gia_su_phan_hoi_luc')->nullable()->after('ngay_xu_ly');
            }

            if (! Schema::hasColumn('yeucau_hocbu', 'ly_do_gia_su')) {
                $table->text('ly_do_gia_su')->nullable()->after('gia_su_phan_hoi_luc');
            }

            if (! Schema::hasColumn('yeucau_hocbu', 'ghi_chu_admin')) {
                $table->text('ghi_chu_admin')->nullable()->after('ly_do_gia_su');
            }
        });
    }
};

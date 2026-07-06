<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE yeucau_hocbu MODIFY trang_thai ENUM('cho_duyet','cho_gia_su_xac_nhan','giasu_dong_y','giasu_tu_choi','da_duyet','tu_choi') NOT NULL DEFAULT 'cho_duyet'");

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

    public function down(): void
    {
        DB::table('yeucau_hocbu')
            ->whereIn('trang_thai', ['cho_gia_su_xac_nhan', 'giasu_dong_y', 'giasu_tu_choi'])
            ->update(['trang_thai' => 'cho_duyet']);

        Schema::table('yeucau_hocbu', function (Blueprint $table) {
            if (Schema::hasColumn('yeucau_hocbu', 'ghi_chu_admin')) {
                $table->dropColumn('ghi_chu_admin');
            }

            if (Schema::hasColumn('yeucau_hocbu', 'ly_do_gia_su')) {
                $table->dropColumn('ly_do_gia_su');
            }

            if (Schema::hasColumn('yeucau_hocbu', 'gia_su_phan_hoi_luc')) {
                $table->dropColumn('gia_su_phan_hoi_luc');
            }
        });

        DB::statement("ALTER TABLE yeucau_hocbu MODIFY trang_thai ENUM('cho_duyet','da_duyet','tu_choi') NOT NULL DEFAULT 'cho_duyet'");
    }
};

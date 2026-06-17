<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('chietkhau') && ! Schema::hasTable('loai_goi')) {
            Schema::rename('chietkhau', 'loai_goi');
        }

        if (Schema::hasTable('loai_goi')) {
            Schema::table('loai_goi', function (Blueprint $table) {
                if (! Schema::hasColumn('loai_goi', 'ten_loai_goi')) {
                    $table->string('ten_loai_goi', 100)->nullable()->after('id');
                }
            });

            if (Schema::hasColumn('loai_goi', 'so_buoi') && ! Schema::hasColumn('loai_goi', 'so_thang')) {
                Schema::table('loai_goi', function (Blueprint $table) {
                    $table->renameColumn('so_buoi', 'so_thang');
                });
            }

            DB::table('loai_goi')->updateOrInsert(
                ['so_thang' => 1],
                [
                    'ten_loai_goi' => 'Gói 1 tháng',
                    'phan_tram_giam' => 0,
                    'mo_ta' => 'Gói học trong 1 tháng',
                    'updated_at' => now(),
                ]
            );
            DB::table('loai_goi')->updateOrInsert(
                ['so_thang' => 3],
                [
                    'ten_loai_goi' => 'Gói 3 tháng',
                    'phan_tram_giam' => 5,
                    'mo_ta' => 'Giảm 5% khi đăng ký gói 3 tháng',
                    'updated_at' => now(),
                ]
            );
            DB::table('loai_goi')->updateOrInsert(
                ['so_thang' => 6],
                [
                    'ten_loai_goi' => 'Gói 6 tháng',
                    'phan_tram_giam' => 10,
                    'mo_ta' => 'Giảm 10% khi đăng ký gói 6 tháng',
                    'updated_at' => now(),
                ]
            );
        }

        if (Schema::hasTable('goihoc') && Schema::hasColumn('goihoc', 'chietkhau_id') && ! Schema::hasColumn('goihoc', 'loai_goi_id')) {
            Schema::table('goihoc', function (Blueprint $table) {
                $table->renameColumn('chietkhau_id', 'loai_goi_id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('goihoc') && Schema::hasColumn('goihoc', 'loai_goi_id') && ! Schema::hasColumn('goihoc', 'chietkhau_id')) {
            Schema::table('goihoc', function (Blueprint $table) {
                $table->renameColumn('loai_goi_id', 'chietkhau_id');
            });
        }

        if (Schema::hasTable('loai_goi')) {
            if (Schema::hasColumn('loai_goi', 'so_thang') && ! Schema::hasColumn('loai_goi', 'so_buoi')) {
                Schema::table('loai_goi', function (Blueprint $table) {
                    $table->renameColumn('so_thang', 'so_buoi');
                });
            }

            if (Schema::hasColumn('loai_goi', 'ten_loai_goi')) {
                Schema::table('loai_goi', function (Blueprint $table) {
                    $table->dropColumn('ten_loai_goi');
                });
            }
        }

        if (Schema::hasTable('loai_goi') && ! Schema::hasTable('chietkhau')) {
            Schema::rename('loai_goi', 'chietkhau');
        }
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('thanhtoan')) {
            return;
        }

        if (Schema::hasColumn('thanhtoan', 'tien_goi') && ! Schema::hasColumn('thanhtoan', 'so_tien')) {
            DB::statement('ALTER TABLE `thanhtoan` CHANGE `tien_goi` `so_tien` DECIMAL(10, 2) NOT NULL');
        }

        foreach (['tien_hoan', 'tong_tien'] as $column) {
            if (Schema::hasColumn('thanhtoan', $column)) {
                Schema::table('thanhtoan', function (Blueprint $table) use ($column) {
                    $table->dropColumn($column);
                });
            }
        }

        if (! Schema::hasColumn('thanhtoan', 'so_tai_khoan')) {
            Schema::table('thanhtoan', function (Blueprint $table) {
                $table->string('so_tai_khoan', 50)->nullable()->after('phuong_thuc');
            });
        }

        if (! Schema::hasColumn('thanhtoan', 'ngay_thanhtoan')) {
            Schema::table('thanhtoan', function (Blueprint $table) {
                $table->dateTime('ngay_thanhtoan')->nullable()->after('ma_giaodich');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('thanhtoan')) {
            return;
        }

        if (Schema::hasColumn('thanhtoan', 'ngay_thanhtoan')) {
            Schema::table('thanhtoan', function (Blueprint $table) {
                $table->dropColumn('ngay_thanhtoan');
            });
        }

        if (Schema::hasColumn('thanhtoan', 'so_tai_khoan')) {
            Schema::table('thanhtoan', function (Blueprint $table) {
                $table->dropColumn('so_tai_khoan');
            });
        }

        if (! Schema::hasColumn('thanhtoan', 'tien_hoan')) {
            Schema::table('thanhtoan', function (Blueprint $table) {
                $table->decimal('tien_hoan', 10, 2)->default(0)->after('so_tien');
            });
        }

        if (! Schema::hasColumn('thanhtoan', 'tong_tien')) {
            Schema::table('thanhtoan', function (Blueprint $table) {
                $table->decimal('tong_tien', 10, 2)->default(0)->after('tien_hoan');
            });
        }

        if (Schema::hasColumn('thanhtoan', 'so_tien') && ! Schema::hasColumn('thanhtoan', 'tien_goi')) {
            DB::statement('ALTER TABLE `thanhtoan` CHANGE `so_tien` `tien_goi` DECIMAL(10, 2) NOT NULL');
        }
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('thanhtoan')) {
            return;
        }

        Schema::table('thanhtoan', function (Blueprint $table) {
            if (! Schema::hasColumn('thanhtoan', 'noi_dung_thanhtoan')) {
                $table->text('noi_dung_thanhtoan')->nullable()->after('ma_giaodich');
            }

            if (! Schema::hasColumn('thanhtoan', 'anh_minh_chung')) {
                $table->string('anh_minh_chung', 255)->nullable()->after('noi_dung_thanhtoan');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('thanhtoan')) {
            return;
        }

        Schema::table('thanhtoan', function (Blueprint $table) {
            if (Schema::hasColumn('thanhtoan', 'anh_minh_chung')) {
                $table->dropColumn('anh_minh_chung');
            }

            if (Schema::hasColumn('thanhtoan', 'noi_dung_thanhtoan')) {
                $table->dropColumn('noi_dung_thanhtoan');
            }
        });
    }
};

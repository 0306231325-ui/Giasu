<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if ($this->hasIndex('loai_goi', 'loai_goi_kieu_so_thang_unique')) {
            DB::statement('ALTER TABLE `loai_goi` DROP INDEX `loai_goi_kieu_so_thang_unique`');
        }

        Schema::table('loai_goi', function (Blueprint $table) {
            if (Schema::hasColumn('loai_goi', 'kieu_goi')) {
                $table->dropColumn('kieu_goi');
            }

            if (Schema::hasColumn('loai_goi', 'so_ngay_hieu_luc')) {
                $table->dropColumn('so_ngay_hieu_luc');
            }
        });

        if (! $this->hasIndex('loai_goi', 'chietkhau_so_buoi_unique') && ! $this->hasDuplicateSoThang()) {
            Schema::table('loai_goi', function (Blueprint $table) {
                $table->unique('so_thang', 'chietkhau_so_buoi_unique');
            });
        }
    }

    public function down(): void
    {
        Schema::table('loai_goi', function (Blueprint $table) {
            if (! Schema::hasColumn('loai_goi', 'kieu_goi')) {
                $table->string('kieu_goi', 30)->default('dinh_ky')->after('ten_loai_goi');
            }

            if (! Schema::hasColumn('loai_goi', 'so_ngay_hieu_luc')) {
                $table->unsignedInteger('so_ngay_hieu_luc')->default(30)->after('so_thang');
            }
        });
    }

    private function hasIndex(string $table, string $index): bool
    {
        return DB::table('information_schema.STATISTICS')
            ->where('TABLE_SCHEMA', DB::getDatabaseName())
            ->where('TABLE_NAME', $table)
            ->where('INDEX_NAME', $index)
            ->exists();
    }

    private function hasDuplicateSoThang(): bool
    {
        return DB::table('loai_goi')
            ->select('so_thang')
            ->groupBy('so_thang')
            ->havingRaw('COUNT(*) > 1')
            ->exists();
    }
};

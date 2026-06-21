<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('giasu')->update(['he_so_gia' => 0]);
        DB::statement('ALTER TABLE `giasu` MODIFY `he_so_gia` DECIMAL(5,2) NOT NULL DEFAULT 0');

        Schema::table('giasu_gia', function (Blueprint $table) {
            if (! Schema::hasColumn('giasu_gia', 'gia_cong_trinh_do')) {
                $table->decimal('gia_cong_trinh_do', 10, 2)
                    ->default(0)
                    ->after('gia_mon');
            }

            if (! Schema::hasColumn('giasu_gia', 'gia_cong_kinh_nghiem')) {
                $table->decimal('gia_cong_kinh_nghiem', 10, 2)
                    ->default(0)
                    ->after('gia_cong_trinh_do');
            }
        });

        DB::table('giasu_gia')
            ->join('giasu', 'giasu.id', '=', 'giasu_gia.giasu_id')
            ->leftJoin('trinh_do_giasu', 'trinh_do_giasu.id', '=', 'giasu.trinh_do_giasu_id')
            ->leftJoin('muc_kinh_nghiem', 'muc_kinh_nghiem.id', '=', 'giasu.muc_kinh_nghiem_id')
            ->update([
                'giasu_gia.gia_cong_trinh_do' => DB::raw(
                    'COALESCE(trinh_do_giasu.gia_cong_them, 0)'
                ),
                'giasu_gia.gia_cong_kinh_nghiem' => DB::raw(
                    'COALESCE(muc_kinh_nghiem.gia_cong_them, 0)'
                ),
                'giasu_gia.gia_cong_them' => DB::raw(
                    '(COALESCE(giasu_gia.gia_mon, 0)
                      + COALESCE(trinh_do_giasu.gia_cong_them, 0)
                      + COALESCE(muc_kinh_nghiem.gia_cong_them, 0))
                     * COALESCE(giasu.he_so_gia, 0) / 100'
                ),
                'giasu_gia.tong_gia' => DB::raw(
                    '(COALESCE(giasu_gia.gia_mon, 0)
                      + COALESCE(trinh_do_giasu.gia_cong_them, 0)
                      + COALESCE(muc_kinh_nghiem.gia_cong_them, 0))
                     * (1 + COALESCE(giasu.he_so_gia, 0) / 100)'
                ),
            ]);
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE `giasu` MODIFY `he_so_gia` DECIMAL(5,2) NOT NULL DEFAULT 1');
        DB::table('giasu')->update(['he_so_gia' => 1]);

        DB::table('giasu_gia')->update([
            'gia_cong_them' => DB::raw(
                'COALESCE(gia_cong_trinh_do, 0) + COALESCE(gia_cong_kinh_nghiem, 0)'
            ),
            'tong_gia' => DB::raw(
                'COALESCE(gia_mon, 0)
                 + COALESCE(gia_cong_trinh_do, 0)
                 + COALESCE(gia_cong_kinh_nghiem, 0)'
            ),
        ]);

        Schema::table('giasu_gia', function (Blueprint $table) {
            foreach (['gia_cong_trinh_do', 'gia_cong_kinh_nghiem'] as $column) {
                if (Schema::hasColumn('giasu_gia', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};

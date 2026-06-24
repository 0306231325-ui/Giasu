<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('phan_hoi', 'phan_hoi')) {
            return;
        }

        DB::table('phan_hoi')
            ->whereNotNull('phan_hoi')
            ->whereNotIn('phan_hoi', ['dong_y', 'tu_choi'])
            ->whereNull('ly_do')
            ->update([
                'ly_do' => DB::raw('phan_hoi'),
            ]);

        DB::table('phan_hoi')
            ->whereNotIn('phan_hoi', ['dong_y', 'tu_choi'])
            ->update([
                'phan_hoi' => 'tu_choi',
            ]);

        DB::statement(
            "ALTER TABLE phan_hoi
             MODIFY phan_hoi ENUM('dong_y', 'tu_choi') NOT NULL"
        );
    }

    public function down(): void
    {
        if (! Schema::hasColumn('phan_hoi', 'phan_hoi')) {
            return;
        }

        DB::statement(
            'ALTER TABLE phan_hoi
             MODIFY phan_hoi TEXT NOT NULL'
        );
    }
};

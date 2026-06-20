<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('giasu_bang_cap', 'loai_bang')) {
            return;
        }

        DB::table('giasu_bang_cap')
            ->whereNotNull('loai_bang')
            ->whereNotIn('loai_bang', ['bang_cap', 'chung_chi', 'khac'])
            ->update(['loai_bang' => 'khac']);

        DB::statement(
            "ALTER TABLE giasu_bang_cap
             MODIFY loai_bang ENUM('bang_cap', 'chung_chi', 'khac') NULL"
        );
    }

    public function down(): void
    {
        if (! Schema::hasColumn('giasu_bang_cap', 'loai_bang')) {
            return;
        }

        DB::statement(
            'ALTER TABLE giasu_bang_cap
             MODIFY loai_bang VARCHAR(100) NULL'
        );
    }
};

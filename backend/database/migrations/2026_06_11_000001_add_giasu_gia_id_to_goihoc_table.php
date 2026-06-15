<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('goihoc') || ! Schema::hasTable('giasu_gia')) {
            return;
        }

        if (! Schema::hasColumn('goihoc', 'giasu_gia_id')) {
            Schema::table('goihoc', function (Blueprint $table) {
                $table->foreignId('giasu_gia_id')
                    ->nullable()
                    ->after('monhoc_id')
                    ->constrained('giasu_gia')
                    ->nullOnDelete();
            });
        }

        DB::table('goihoc')
            ->join('giasu_gia', function ($join) {
                $join->on('giasu_gia.giasu_id', '=', 'goihoc.giasu_id')
                    ->on('giasu_gia.monhoc_id', '=', 'goihoc.monhoc_id');
            })
            ->whereNull('goihoc.giasu_gia_id')
            ->update([
                'goihoc.giasu_gia_id' => DB::raw('giasu_gia.id'),
            ]);
    }

    public function down(): void
    {
        if (! Schema::hasTable('goihoc') || ! Schema::hasColumn('goihoc', 'giasu_gia_id')) {
            return;
        }

        Schema::table('goihoc', function (Blueprint $table) {
            $table->dropConstrainedForeignId('giasu_gia_id');
        });
    }
};

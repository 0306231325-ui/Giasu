<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('danhgia')) {
            return;
        }

        if (! Schema::hasColumn('danhgia', 'user_id')) {
            Schema::table('danhgia', function (Blueprint $table) {
                $table->foreignId('user_id')
                    ->nullable()
                    ->after('lichhoc_id')
                    ->constrained('users')
                    ->nullOnDelete();
            });
        }

        DB::table('danhgia')
            ->join('lichhoc', 'lichhoc.id', '=', 'danhgia.lichhoc_id')
            ->join('goihoc', 'goihoc.id', '=', 'lichhoc.goihoc_id')
            ->whereNull('danhgia.user_id')
            ->update([
                'danhgia.user_id' => DB::raw('goihoc.hocvien_id'),
            ]);
    }

    public function down(): void
    {
        if (! Schema::hasTable('danhgia') || ! Schema::hasColumn('danhgia', 'user_id')) {
            return;
        }

        Schema::table('danhgia', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });
    }
};

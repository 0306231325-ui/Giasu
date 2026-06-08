<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('lichhoc') || Schema::hasColumn('lichhoc', 'goihoc_lich_dinhky_id')) {
            return;
        }

        Schema::table('lichhoc', function (Blueprint $table) {
            $table->foreignId('goihoc_lich_dinhky_id')
                ->nullable()
                ->after('goihoc_id')
                ->constrained('goihoc_lich_dinhky')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('lichhoc') || ! Schema::hasColumn('lichhoc', 'goihoc_lich_dinhky_id')) {
            return;
        }

        Schema::table('lichhoc', function (Blueprint $table) {
            $table->dropConstrainedForeignId('goihoc_lich_dinhky_id');
        });
    }
};

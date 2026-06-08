<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('baiviet') || Schema::hasColumn('baiviet', 'deleted_by_id')) {
            return;
        }

        Schema::table('baiviet', function (Blueprint $table) {
            $table->foreignId('deleted_by_id')
                ->nullable()
                ->after('deleted_at')
                ->constrained('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('baiviet') || ! Schema::hasColumn('baiviet', 'deleted_by_id')) {
            return;
        }

        Schema::table('baiviet', function (Blueprint $table) {
            $table->dropConstrainedForeignId('deleted_by_id');
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('giasu_bang_cap', 'trinh_do_giasu_id')) {
            return;
        }

        Schema::table('giasu_bang_cap', function (Blueprint $table) {
            $table->foreignId('trinh_do_giasu_id')
                ->nullable()
                ->after('loai_bang')
                ->constrained('trinh_do_giasu')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('giasu_bang_cap', 'trinh_do_giasu_id')) {
            return;
        }

        Schema::table('giasu_bang_cap', function (Blueprint $table) {
            $table->dropConstrainedForeignId('trinh_do_giasu_id');
        });
    }
};

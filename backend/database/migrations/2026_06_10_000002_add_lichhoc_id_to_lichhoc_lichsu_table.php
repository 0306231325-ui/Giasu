<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('lichhoc_lichsu') && ! Schema::hasColumn('lichhoc_lichsu', 'lichhoc_id')) {
            Schema::table('lichhoc_lichsu', function (Blueprint $table) {
                $table->foreignId('lichhoc_id')->after('id')->constrained('lichhoc')->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        // Schema adjustment is intentionally not auto-reversible.
    }
};

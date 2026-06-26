<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('giasu', function (Blueprint $table) {
            if (Schema::hasColumn('giasu', 'hoc_van')) {
                $table->dropColumn('hoc_van');
            }
        });
    }

    public function down(): void
    {
        Schema::table('giasu', function (Blueprint $table) {
            if (! Schema::hasColumn('giasu', 'hoc_van')) {
                $table->string('hoc_van')->nullable()->after('he_so_gia');
            }
        });
    }
};

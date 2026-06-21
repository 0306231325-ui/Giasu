<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('giasu', 'truong_hoc')) {
            Schema::table('giasu', function (Blueprint $table) {
                $table->dropColumn('truong_hoc');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('giasu', 'truong_hoc')) {
            Schema::table('giasu', function (Blueprint $table) {
                $table->string('truong_hoc')->nullable()->after('hoc_van');
            });
        }
    }
};

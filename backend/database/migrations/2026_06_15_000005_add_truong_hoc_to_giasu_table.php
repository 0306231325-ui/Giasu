<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('giasu', function (Blueprint $table) {
            $table->string('truong_hoc')->nullable()->after('hoc_van');
        });
    }

    public function down(): void
    {
        Schema::table('giasu', function (Blueprint $table) {
            $table->dropColumn('truong_hoc');
        });
    }
};

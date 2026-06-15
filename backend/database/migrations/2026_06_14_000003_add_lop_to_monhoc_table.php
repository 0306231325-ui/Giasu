<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('monhoc', function (Blueprint $table) {
            $table->string('lop', 50)->nullable()->after('cap_hoc_id');
        });
    }

    public function down(): void
    {
        Schema::table('monhoc', function (Blueprint $table) {
            $table->dropColumn('lop');
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('giasu_bang_cap', function (Blueprint $table) {
            $table->string('loai_bang', 100)->nullable()->after('ten_bang');
        });
    }

    public function down(): void
    {
        Schema::table('giasu_bang_cap', function (Blueprint $table) {
            $table->dropColumn('loai_bang');
        });
    }
};


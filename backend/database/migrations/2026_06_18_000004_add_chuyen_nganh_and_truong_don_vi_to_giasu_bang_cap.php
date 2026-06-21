<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('giasu_bang_cap', function (Blueprint $table) {
            $table->string('chuyen_nganh', 255)
                ->nullable()
                ->after('loai_bang');
            $table->string('truong_don_vi', 255)
                ->nullable()
                ->after('chuyen_nganh');
        });
    }

    public function down(): void
    {
        Schema::table('giasu_bang_cap', function (Blueprint $table) {
            $table->dropColumn(['chuyen_nganh', 'truong_don_vi']);
        });
    }
};

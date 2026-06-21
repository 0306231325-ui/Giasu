<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('hocvien', 'avatar')) {
            Schema::table('hocvien', function (Blueprint $table) {
                $table->string('avatar', 255)
                    ->nullable()
                    ->after('dia_chi');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('hocvien', 'avatar')) {
            Schema::table('hocvien', function (Blueprint $table) {
                $table->dropColumn('avatar');
            });
        }
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('cap_hoc', 'gia_cong_them')) {
            Schema::table('cap_hoc', function (Blueprint $table) {
                $table->dropColumn('gia_cong_them');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('cap_hoc', 'gia_cong_them')) {
            Schema::table('cap_hoc', function (Blueprint $table) {
                $table->decimal('gia_cong_them', 10, 2)->default(0)->after('thu_tu');
            });
        }
    }
};

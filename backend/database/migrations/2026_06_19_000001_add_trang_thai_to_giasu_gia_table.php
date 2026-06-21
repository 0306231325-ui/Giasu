<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('giasu_gia', function (Blueprint $table) {
            $table->enum('trang_thai', [
                'cho_duyet',
                'da_duyet',
                'tu_choi',
                'ngung_day',
            ])->default('cho_duyet')->after('tong_gia');
            $table->text('ly_do_tu_choi')->nullable()->after('trang_thai');
        });

        DB::table('giasu_gia')->update([
            'trang_thai' => 'da_duyet',
        ]);
    }

    public function down(): void
    {
        Schema::table('giasu_gia', function (Blueprint $table) {
            $table->dropColumn([
                'trang_thai',
                'ly_do_tu_choi',
            ]);
        });
    }
};

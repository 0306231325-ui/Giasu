<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lichhoc_lichsu', function (Blueprint $table) {
            $table->dropColumn('loai_su_kien');
        });
    }

    public function down(): void
    {
        Schema::table('lichhoc_lichsu', function (Blueprint $table) {
            $table->string('loai_su_kien', 50)
                ->nullable()
                ->after('nguoi_thay_doi_id');
        });
    }
};

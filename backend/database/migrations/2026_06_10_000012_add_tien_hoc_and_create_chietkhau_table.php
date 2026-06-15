<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('lichhoc') && ! Schema::hasColumn('lichhoc', 'tien_hoc')) {
            Schema::table('lichhoc', function (Blueprint $table) {
                $table->decimal('tien_hoc', 10, 2)->default(0)->after('hinh_thuc_hoc');
            });
        }

        if (! Schema::hasTable('chietkhau')) {
            Schema::create('chietkhau', function (Blueprint $table) {
                $table->id();
                $table->unsignedInteger('so_buoi');
                $table->decimal('phan_tram_giam', 5, 2)->default(0);
                $table->string('mo_ta', 255)->nullable();
                $table->timestamps();

                $table->unique('so_buoi');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('chietkhau');

        if (Schema::hasTable('lichhoc') && Schema::hasColumn('lichhoc', 'tien_hoc')) {
            Schema::table('lichhoc', function (Blueprint $table) {
                $table->dropColumn('tien_hoc');
            });
        }
    }
};

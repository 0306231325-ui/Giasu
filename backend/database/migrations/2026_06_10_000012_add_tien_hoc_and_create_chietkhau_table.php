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

        if (! Schema::hasTable('loai_goi')) {
            Schema::create('loai_goi', function (Blueprint $table) {
                $table->id();
                $table->string('ten_loai_goi', 100);
                $table->unsignedInteger('so_thang');
                $table->decimal('phan_tram_giam', 5, 2)->default(0);
                $table->string('mo_ta', 255)->nullable();
                $table->timestamps();

                $table->unique('so_thang');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('loai_goi');

        if (Schema::hasTable('lichhoc') && Schema::hasColumn('lichhoc', 'tien_hoc')) {
            Schema::table('lichhoc', function (Blueprint $table) {
                $table->dropColumn('tien_hoc');
            });
        }
    }
};

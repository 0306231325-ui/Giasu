<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('muc_kinh_nghiem', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('tu_khoang');
            $table->unsignedTinyInteger('den_khoang')->nullable();
            $table->decimal('gia_cong_them', 10, 2)->default(0);
            $table->timestamps();

            $table->unique(['tu_khoang', 'den_khoang']);
        });

        Schema::table('giasu', function (Blueprint $table) {
            $table->unsignedTinyInteger('so_nam_kinh_nghiem')
                ->default(0)
                ->after('kinh_nghiem');
        });

        Schema::table('giasu_gia', function (Blueprint $table) {
            $table->renameColumn('gia_cong_them', 'gia_cong_trinh_do');
        });

        Schema::table('giasu_gia', function (Blueprint $table) {
            $table->decimal('gia_cong_kinh_nghiem', 10, 2)
                ->default(0)
                ->after('gia_cong_trinh_do');
        });
    }

    public function down(): void
    {
        Schema::table('giasu_gia', function (Blueprint $table) {
            $table->dropColumn('gia_cong_kinh_nghiem');
        });

        Schema::table('giasu_gia', function (Blueprint $table) {
            $table->renameColumn('gia_cong_trinh_do', 'gia_cong_them');
        });

        Schema::table('giasu', function (Blueprint $table) {
            $table->dropColumn('so_nam_kinh_nghiem');
        });

        Schema::dropIfExists('muc_kinh_nghiem');
    }
};

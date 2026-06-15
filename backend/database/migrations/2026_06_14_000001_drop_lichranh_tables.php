<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('lichranh_lichsu');
        Schema::dropIfExists('lichranh');
    }

    public function down(): void
    {
        Schema::create('lichranh', function (Blueprint $table) {
            $table->id();
            $table->foreignId('giasu_id')->constrained('giasu')->cascadeOnDelete();
            $table->tinyInteger('thu');
            $table->time('gio_batdau');
            $table->time('gio_ketthuc');
            $table->enum('trang_thai', ['ranh', 'ban'])->default('ranh');
            $table->timestamps();
        });

        Schema::create('lichranh_lichsu', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lichranh_id')->nullable()->constrained('lichranh')->nullOnDelete();
            $table->tinyInteger('thu')->nullable();
            $table->time('gio_batdau')->nullable();
            $table->time('gio_ketthuc')->nullable();
            $table->enum('trang_thai', ['ranh', 'ban'])->nullable();
            $table->date('ngay_tao')->nullable();
            $table->date('ngay_ap_dung')->nullable();
            $table->timestamps();
        });
    }
};

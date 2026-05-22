<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lichranh', function (Blueprint $table) {
            $table->id();
            $table->foreignId('giasu_id')->constrained('giasu')->onDelete('cascade');
            $table->tinyInteger('thu');
            $table->time('gio_batdau');
            $table->time('gio_ketthuc');
            $table->enum('trang_thai', ['ranh', 'ban'])->default('ranh');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lichranh');
    }
};

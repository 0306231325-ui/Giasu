<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('danhgia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lichhoc_id')->constrained('lichhoc')->onDelete('cascade');
            $table->tinyInteger('so_sao');
            $table->text('noi_dung')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('danhgia');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('phan_hoi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gia_su_id')->constrained('giasu')->cascadeOnDelete();
            $table->foreignId('goi_hoc_id')->constrained('goihoc')->cascadeOnDelete();
            $table->text('phan_hoi');
            $table->text('ly_do')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('phan_hoi');
    }
};

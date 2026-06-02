<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('giasu_mon_lop', function (Blueprint $table) {
            $table->id();
            $table->foreignId('giasu_id')->constrained('giasu')->onDelete('cascade');
            $table->foreignId('monhoc_id')->constrained('monhoc')->onDelete('cascade');
            $table->foreignId('lop_id')->constrained('lop')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['giasu_id', 'monhoc_id', 'lop_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('giasu_mon_lop');
    }
};

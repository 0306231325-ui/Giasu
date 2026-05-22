<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('giasu_monhoc', function (Blueprint $table) {
            $table->id();
            $table->foreignId('giasu_id')->constrained('giasu')->onDelete('cascade');
            $table->foreignId('monhoc_id')->constrained('monhoc')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('giasu_monhoc');
    }
};

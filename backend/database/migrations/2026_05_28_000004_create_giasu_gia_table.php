<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('giasu_gia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('giasu_id')->constrained('giasu')->onDelete('cascade');
            $table->foreignId('cap_hoc_id')->constrained('cap_hoc')->onDelete('cascade');
            $table->decimal('gia_theogio', 10, 2);
            $table->foreignId('yeu_cau_gia_id')->nullable()->constrained('yeu_cau_gia')->nullOnDelete();
            $table->timestamps();

            $table->unique(['giasu_id', 'cap_hoc_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('giasu_gia');
    }
};


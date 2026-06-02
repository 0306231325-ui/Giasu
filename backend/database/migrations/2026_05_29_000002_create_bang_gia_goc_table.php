<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bang_gia_goc', function (Blueprint $table) {
            $table->id();
            $table->foreignId('monhoc_id')->constrained('monhoc')->onDelete('cascade');
            $table->foreignId('cap_hoc_id')->constrained('cap_hoc')->onDelete('cascade');
            $table->decimal('gia_goc', 10, 2);
            $table->decimal('gia_min', 10, 2)->nullable();
            $table->decimal('gia_max', 10, 2)->nullable();
            $table->text('ghi_chu')->nullable();
            $table->timestamps();

            $table->unique(['monhoc_id', 'cap_hoc_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bang_gia_goc');
    }
};

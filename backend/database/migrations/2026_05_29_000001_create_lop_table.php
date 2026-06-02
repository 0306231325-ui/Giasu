<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lop', function (Blueprint $table) {
            $table->id();
            $table->string('ten', 50);
            $table->unsignedTinyInteger('so_lop');
            $table->foreignId('cap_hoc_id')->constrained('cap_hoc')->onDelete('cascade');
            $table->unsignedTinyInteger('thu_tu_trong_cap')->default(1);
            $table->timestamps();

            $table->unique(['so_lop', 'cap_hoc_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lop');
    }
};

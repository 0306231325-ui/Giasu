<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cap_hoc', function (Blueprint $table) {
            $table->id();
            $table->string('ma', 50)->unique();
            $table->string('ten', 100);
            $table->integer('thu_tu')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cap_hoc');
    }
};


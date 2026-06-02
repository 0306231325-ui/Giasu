<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bang_gia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cap_hoc_id')->constrained('cap_hoc')->onDelete('cascade');
            $table->decimal('gia_mac_dinh', 10, 2);
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bang_gia');
    }
};


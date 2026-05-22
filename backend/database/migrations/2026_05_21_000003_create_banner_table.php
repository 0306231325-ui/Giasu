<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('banner', function (Blueprint $table) {
            $table->id();
            $table->string('tieu_de', 255);
            $table->text('mo_ta')->nullable();
            $table->string('anh', 255)->nullable();
            $table->enum('trang_thai', ['hienthi', 'an'])->default('hienthi');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('banner');
    }
};

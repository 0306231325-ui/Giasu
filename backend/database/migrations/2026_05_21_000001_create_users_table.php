<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('ho_ten', 100);
            $table->string('email', 100)->unique();
            $table->string('password', 100);
            $table->string('sdt', 20)->nullable();
            $table->enum('vai_tro', ['admin', 'hocvien', 'giasu']);
            $table->string('anh_dai_dien', 255)->nullable();
            $table->enum('trang_thai', ['hoatdong', 'khoa'])->default('hoatdong');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
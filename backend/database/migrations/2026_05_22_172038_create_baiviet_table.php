<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('baiviet', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            $table->string('tieu_de', 255);
            $table->string('slug', 255)->unique();
            $table->text('tom_tat')->nullable(); 
            $table->longText('noi_dung');
            $table->string('anh_bia', 255)->nullable(); 
            $table->unsignedInteger('luot_xem')->default(0); 
            
            $table->enum('trang_thai', ['xuat_ban', 'nhap', 'an'])->default('xuat_ban'); 
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('baiviet');
    }
};
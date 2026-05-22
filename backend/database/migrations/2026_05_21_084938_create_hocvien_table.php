<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hocvien', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            

            $table->string('lop', 50)->nullable(); 
            $table->string('truong_hoc', 255)->nullable(); 
            $table->string('dia_chi', 255)->nullable(); 
            $table->string('ten_phu_huynh', 100)->nullable(); 
            $table->string('sdt_phu_huynh', 20)->nullable(); 
            $table->text('muc_tieu_hoc_tap')->nullable(); 
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hocvien');
    }
};
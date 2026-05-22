<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('goihoc', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hocvien_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('giasu_id')->constrained('giasu')->onDelete('cascade');
            $table->foreignId('monhoc_id')->constrained('monhoc')->onDelete('cascade');
            $table->date('ngay_batdau');
            $table->date('ngay_ketthuc');
            $table->integer('so_buoi');
            $table->boolean('hoc_dinhky')->default(true);
            $table->decimal('tong_tien', 10, 2)->default(0.00);
            $table->enum('trang_thai', ['cho_xacnhan', 'cho_thanhtoan', 'danghoc', 'hoanthanh', 'dahuy'])->default('cho_xacnhan');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goihoc');
    }
};

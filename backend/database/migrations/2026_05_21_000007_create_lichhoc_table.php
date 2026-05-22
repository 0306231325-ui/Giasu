<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lichhoc', function (Blueprint $table) {
            $table->id();
            $table->foreignId('goihoc_id')->constrained('goihoc')->onDelete('cascade');
            $table->date('ngay_hoc');
            $table->time('gio_batdau');
            $table->time('gio_ketthuc');
            $table->decimal('phi_hoahong', 10, 2)->default(0.00);
            $table->decimal('tien_giasu_nhan', 10, 2)->default(0.00);
            $table->enum('trang_thai', ['cho_xacnhan', 'da_nhan', 'hoanthanh', 'dahuy'])->default('da_nhan');
            $table->text('ghi_chu')->nullable();
            
            // Xử lý set null khi user bị xoá (đúng với constraint trong DB của ông)
            $table->foreignId('nguoi_huy_id')->nullable()->constrained('users')->nullOnDelete();
            
            $table->text('lydo_huy')->nullable();
            $table->dateTime('thoigian_huy')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lichhoc');
    }
};
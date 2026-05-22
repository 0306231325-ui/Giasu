<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('thanhtoan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('goihoc_id')->constrained('goihoc')->onDelete('cascade');
            $table->decimal('so_tien', 10, 2);
            $table->enum('phuong_thuc', ['tienmat', 'momo', 'zalopay', 'banking'])->default('tienmat');
            $table->string('ma_giaodich', 255)->nullable();
            $table->enum('trang_thai', ['cho_thanhtoan', 'da_thanhtoan', 'that_bai'])->default('cho_thanhtoan');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('thanhtoan');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('yeu_cau_gia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('giasu_id')->constrained('giasu')->onDelete('cascade');
            $table->foreignId('cap_hoc_id')->constrained('cap_hoc')->onDelete('cascade');
            $table->enum('trang_thai', ['cho_duyet', 'duyet', 'tu_choi'])->default('cho_duyet');
            $table->decimal('gia_duyet', 10, 2)->nullable();
            $table->foreignId('duyet_boi')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('duyet_luc')->nullable();
            $table->text('ly_do')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('yeu_cau_gia');
    }
};


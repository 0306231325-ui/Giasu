<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('giasu_bang_cap', function (Blueprint $table) {
            $table->id();
            $table->foreignId('giasu_id')->constrained('giasu')->onDelete('cascade');
            $table->string('ten_bang', 255);
            $table->string('file_url', 500);
            $table->enum('trang_thai', ['cho_duyet', 'duyet', 'tu_choi'])->default('cho_duyet');
            $table->foreignId('duyet_boi')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('duyet_luc')->nullable();
            $table->text('ly_do')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('giasu_bang_cap');
    }
};

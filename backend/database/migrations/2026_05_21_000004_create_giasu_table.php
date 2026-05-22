<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('giasu', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->text('mo_ta')->nullable();
            $table->text('kinh_nghiem')->nullable();
            $table->string('hoc_van', 255)->nullable();
            $table->decimal('gia_theogio', 10, 2)->nullable();
            $table->string('dia_chi', 255)->nullable();
            $table->float('tong_danhgia')->default(0);
            $table->string('avatar', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('giasu');
    }
};

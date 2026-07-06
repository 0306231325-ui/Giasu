<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nhat_ky_he_thong', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('hanh_dong', 100);
            $table->string('vai_tro', 30)->nullable();
            $table->unsignedBigInteger('doi_tuong_id')->nullable();
            $table->text('noi_dung');
            $table->timestamp('created_at')->nullable();

            $table->index(['vai_tro', 'hanh_dong']);
            $table->index('doi_tuong_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nhat_ky_he_thong');
    }
};

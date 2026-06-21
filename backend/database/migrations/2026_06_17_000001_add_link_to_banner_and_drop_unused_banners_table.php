<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('banner') && ! Schema::hasColumn('banner', 'link')) {
            Schema::table('banner', function (Blueprint $table) {
                $table->string('link')->nullable()->after('anh');
            });
        }

        Schema::dropIfExists('banners');
    }

    public function down(): void
    {
        if (! Schema::hasTable('banners')) {
            Schema::create('banners', function (Blueprint $table) {
                $table->id();
                $table->timestamps();
            });
        }

        if (Schema::hasTable('banner') && Schema::hasColumn('banner', 'link')) {
            Schema::table('banner', function (Blueprint $table) {
                $table->dropColumn('link');
            });
        }
    }
};

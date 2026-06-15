<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->date('ngay_sinh')->nullable()->after('ho_ten');
        });

        DB::table('users')
            ->join('giasu', 'giasu.user_id', '=', 'users.id')
            ->whereNotNull('giasu.ngay_sinh')
            ->update([
                'users.ngay_sinh' => DB::raw('giasu.ngay_sinh'),
            ]);

        Schema::table('giasu', function (Blueprint $table) {
            $table->dropColumn('ngay_sinh');
        });
    }

    public function down(): void
    {
        Schema::table('giasu', function (Blueprint $table) {
            $table->date('ngay_sinh')->nullable()->after('user_id');
        });

        DB::table('giasu')
            ->join('users', 'users.id', '=', 'giasu.user_id')
            ->whereNotNull('users.ngay_sinh')
            ->update([
                'giasu.ngay_sinh' => DB::raw('users.ngay_sinh'),
            ]);

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('ngay_sinh');
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('giasu', function (Blueprint $table) {
            $table->foreignId('cap_hoc_id')->nullable()->after('hoc_van')->constrained('cap_hoc')->nullOnDelete();
            $table->enum('trang_thai_ho_so', ['cho_duyet', 'duyet', 'tu_choi'])->default('cho_duyet')->after('cap_hoc_id');
            $table->foreignId('duyet_boi')->nullable()->after('trang_thai_ho_so')->constrained('users')->nullOnDelete();
            $table->timestamp('duyet_luc')->nullable()->after('duyet_boi');
            $table->text('ly_do_tu_choi')->nullable()->after('duyet_luc');

            if (Schema::hasColumn('giasu', 'gia_theogio')) {
                $table->dropColumn('gia_theogio');
            }
        });

        Schema::table('goihoc', function (Blueprint $table) {
            $table->foreignId('cap_hoc_id')->nullable()->after('monhoc_id')->constrained('cap_hoc')->nullOnDelete();
            $table->decimal('don_gia_theogio', 10, 2)->nullable()->after('hoc_dinhky');
            $table->foreignId('giasu_gia_id')->nullable()->after('don_gia_theogio')->constrained('giasu_gia')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('goihoc', function (Blueprint $table) {
            $table->dropForeign(['cap_hoc_id']);
            $table->dropColumn('cap_hoc_id');

            $table->dropForeign(['giasu_gia_id']);
            $table->dropColumn('giasu_gia_id');

            $table->dropColumn('don_gia_theogio');
        });

        Schema::table('giasu', function (Blueprint $table) {
            $table->dropForeign(['cap_hoc_id']);
            $table->dropColumn('cap_hoc_id');

            $table->dropForeign(['duyet_boi']);
            $table->dropColumn('duyet_boi');

            $table->dropColumn('trang_thai_ho_so');
            $table->dropColumn('duyet_luc');
            $table->dropColumn('ly_do_tu_choi');

            $table->decimal('gia_theogio', 10, 2)->nullable();
        });
    }
};


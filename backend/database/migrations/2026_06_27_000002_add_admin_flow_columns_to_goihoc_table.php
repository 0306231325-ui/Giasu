<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('goihoc', function (Blueprint $table) {
            if (! Schema::hasColumn('goihoc', 'gui_giasu_luc')) {
                $table->timestamp('gui_giasu_luc')->nullable()->after('trang_thai');
            }

            if (! Schema::hasColumn('goihoc', 'admin_xu_ly_id')) {
                $table->foreignId('admin_xu_ly_id')
                    ->nullable()
                    ->after('gui_giasu_luc')
                    ->constrained('users')
                    ->nullOnDelete();
            }

            if (! Schema::hasColumn('goihoc', 'ly_do_huy')) {
                $table->text('ly_do_huy')->nullable()->after('admin_xu_ly_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('goihoc', function (Blueprint $table) {
            if (Schema::hasColumn('goihoc', 'ly_do_huy')) {
                $table->dropColumn('ly_do_huy');
            }

            if (Schema::hasColumn('goihoc', 'admin_xu_ly_id')) {
                $table->dropConstrainedForeignId('admin_xu_ly_id');
            }

            if (Schema::hasColumn('goihoc', 'gui_giasu_luc')) {
                $table->dropColumn('gui_giasu_luc');
            }
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private function dropForeignIfExists(string $table, string $column): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        $constraints = DB::select(
            'SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?
             AND REFERENCED_TABLE_NAME IS NOT NULL',
            [$table, $column],
        );

        foreach ($constraints as $constraint) {
            DB::statement("ALTER TABLE `{$table}` DROP FOREIGN KEY `{$constraint->CONSTRAINT_NAME}`");
        }
    }

    public function up(): void
    {
        if (Schema::hasTable('yeucau_hocbu')) {
            Schema::table('yeucau_hocbu', function (Blueprint $table) {
                if (! Schema::hasColumn('yeucau_hocbu', 'ngay_yeu_cau')) {
                    $table->dateTime('ngay_yeu_cau')
                        ->nullable()
                        ->after('nguoi_yeu_cau_id');
                }

                if (! Schema::hasColumn('yeucau_hocbu', 'ngay_xu_ly')) {
                    $table->dateTime('ngay_xu_ly')
                        ->nullable()
                        ->after('nguoi_duyet_id');
                }
            });

            DB::table('yeucau_hocbu')
                ->whereNull('ngay_yeu_cau')
                ->update([
                    'ngay_yeu_cau' => DB::raw('created_at'),
                ]);
        }

        if (Schema::hasTable('giasu_bang_cap') && ! Schema::hasColumn('giasu_bang_cap', 'trinh_do_giasu_id')) {
            Schema::table('giasu_bang_cap', function (Blueprint $table) {
                $table->foreignId('trinh_do_giasu_id')
                    ->nullable()
                    ->after('loai_bang')
                    ->constrained('trinh_do_giasu')
                    ->nullOnDelete();
            });
        }

        if (Schema::hasTable('lichhoc') && ! Schema::hasColumn('lichhoc', 'lydo_huy')) {
            Schema::table('lichhoc', function (Blueprint $table) {
                $table->text('lydo_huy')
                    ->nullable()
                    ->after('trang_thai');
            });
        }

        Schema::dropIfExists('lichhoc_lichsu');
    }

    public function down(): void
    {
        if (! Schema::hasTable('lichhoc_lichsu')) {
            Schema::create('lichhoc_lichsu', function (Blueprint $table) {
                $table->id();
                $table->foreignId('lichhoc_id')->constrained('lichhoc')->cascadeOnDelete();
                $table->foreignId('nguoi_thay_doi_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('trang_thai_cu', 50)->nullable();
                $table->string('trang_thai_moi', 50)->nullable();
                $table->text('ly_do')->nullable();
                $table->enum('hinh_thuc_xu_ly', ['hoc_bu', 'khong_hoan'])->nullable();
                $table->date('ngay_tao')->nullable();
                $table->timestamps();
            });
        }

        if (Schema::hasTable('giasu_bang_cap') && Schema::hasColumn('giasu_bang_cap', 'trinh_do_giasu_id')) {
            $this->dropForeignIfExists('giasu_bang_cap', 'trinh_do_giasu_id');

            Schema::table('giasu_bang_cap', function (Blueprint $table) {
                $table->dropColumn('trinh_do_giasu_id');
            });
        }

        if (Schema::hasTable('yeucau_hocbu')) {
            Schema::table('yeucau_hocbu', function (Blueprint $table) {
                foreach (['ngay_xu_ly', 'ngay_yeu_cau'] as $column) {
                    if (Schema::hasColumn('yeucau_hocbu', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }
};

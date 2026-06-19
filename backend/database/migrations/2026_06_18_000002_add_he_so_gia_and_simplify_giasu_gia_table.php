<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private function dropForeignIfExists(string $table, string $column): void
    {
        $constraints = DB::select(
            'SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?
             AND REFERENCED_TABLE_NAME IS NOT NULL',
            [$table, $column]
        );

        foreach ($constraints as $constraint) {
            DB::statement("ALTER TABLE `{$table}` DROP FOREIGN KEY `{$constraint->CONSTRAINT_NAME}`");
        }
    }

    public function up(): void
    {
        Schema::table('giasu', function (Blueprint $table) {
            if (! Schema::hasColumn('giasu', 'he_so_gia')) {
                $table->decimal('he_so_gia', 5, 2)
                    ->default(1)
                    ->after('muc_kinh_nghiem_id');
            }
        });

        Schema::table('giasu_gia', function (Blueprint $table) {
            if (! Schema::hasColumn('giasu_gia', 'gia_cong_them')) {
                $table->decimal('gia_cong_them', 10, 2)
                    ->default(0)
                    ->after('gia_mon');
            }
        });

        DB::table('giasu_gia')
            ->join('giasu', 'giasu.id', '=', 'giasu_gia.giasu_id')
            ->update([
                'giasu_gia.gia_cong_them' => DB::raw(
                    'COALESCE(giasu_gia.gia_cong_trinh_do, 0)
                     + COALESCE(giasu_gia.gia_cong_kinh_nghiem, 0)'
                ),
                'giasu_gia.tong_gia' => DB::raw(
                    '(COALESCE(giasu_gia.gia_mon, 0)
                      + COALESCE(giasu_gia.gia_cong_trinh_do, 0)
                      + COALESCE(giasu_gia.gia_cong_kinh_nghiem, 0))
                     * COALESCE(giasu.he_so_gia, 1)'
                ),
            ]);

        $this->dropForeignIfExists('giasu_gia', 'trinh_do_giasu_id');

        Schema::table('giasu_gia', function (Blueprint $table) {
            foreach (['trinh_do_giasu_id', 'gia_cong_trinh_do', 'gia_cong_kinh_nghiem'] as $column) {
                if (Schema::hasColumn('giasu_gia', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('giasu', function (Blueprint $table) {
            if (Schema::hasColumn('giasu', 'kinh_nghiem')) {
                $table->dropColumn('kinh_nghiem');
            }
        });
    }

    public function down(): void
    {
        Schema::table('giasu', function (Blueprint $table) {
            if (! Schema::hasColumn('giasu', 'kinh_nghiem')) {
                $table->text('kinh_nghiem')->nullable()->after('mo_ta');
            }
        });

        Schema::table('giasu_gia', function (Blueprint $table) {
            if (! Schema::hasColumn('giasu_gia', 'trinh_do_giasu_id')) {
                $table->foreignId('trinh_do_giasu_id')
                    ->nullable()
                    ->after('monhoc_id')
                    ->constrained('trinh_do_giasu')
                    ->nullOnDelete();
            }

            if (! Schema::hasColumn('giasu_gia', 'gia_cong_trinh_do')) {
                $table->decimal('gia_cong_trinh_do', 10, 2)->default(0)->after('gia_mon');
            }

            if (! Schema::hasColumn('giasu_gia', 'gia_cong_kinh_nghiem')) {
                $table->decimal('gia_cong_kinh_nghiem', 10, 2)
                    ->default(0)
                    ->after('gia_cong_trinh_do');
            }
        });

        DB::table('giasu_gia')
            ->join('giasu', 'giasu.id', '=', 'giasu_gia.giasu_id')
            ->update([
                'giasu_gia.trinh_do_giasu_id' => DB::raw('giasu.trinh_do_giasu_id'),
                'giasu_gia.gia_cong_trinh_do' => DB::raw('giasu_gia.gia_cong_them'),
                'giasu_gia.gia_cong_kinh_nghiem' => 0,
            ]);

        Schema::table('giasu_gia', function (Blueprint $table) {
            if (Schema::hasColumn('giasu_gia', 'gia_cong_them')) {
                $table->dropColumn('gia_cong_them');
            }
        });

        Schema::table('giasu', function (Blueprint $table) {
            if (Schema::hasColumn('giasu', 'he_so_gia')) {
                $table->dropColumn('he_so_gia');
            }
        });
    }
};

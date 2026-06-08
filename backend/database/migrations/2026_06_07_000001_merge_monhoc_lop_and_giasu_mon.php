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
        Schema::disableForeignKeyConstraints();

        if (! Schema::hasColumn('monhoc', 'cap_hoc_id')) {
            Schema::table('monhoc', function (Blueprint $table) {
                $table->foreignId('cap_hoc_id')->nullable()->after('mo_ta')->constrained('cap_hoc')->nullOnDelete();
                $table->unsignedTinyInteger('so_lop')->nullable()->after('cap_hoc_id');
                $table->unsignedTinyInteger('thu_tu_trong_cap')->nullable()->after('so_lop');
                $table->decimal('gia', 10, 2)->nullable()->after('thu_tu_trong_cap');
            });
        }

        $monLopToMonhoc = [];

        if (Schema::hasTable('mon_lop')) {
            $monLops = DB::table('mon_lop')
                ->join('monhoc as m', 'm.id', '=', 'mon_lop.monhoc_id')
                ->join('lop', 'lop.id', '=', 'mon_lop.lop_id')
                ->select(
                    'mon_lop.id as mon_lop_id',
                    'm.ten_mon',
                    'm.mo_ta',
                    'lop.cap_hoc_id',
                    'lop.so_lop',
                    'lop.thu_tu_trong_cap',
                    'mon_lop.gia_goc as gia'
                )
                ->get();

            $now = now();

            foreach ($monLops as $row) {
                $monhocId = DB::table('monhoc')->insertGetId([
                    'ten_mon' => $row->ten_mon,
                    'mo_ta' => $row->mo_ta,
                    'cap_hoc_id' => $row->cap_hoc_id,
                    'so_lop' => $row->so_lop,
                    'thu_tu_trong_cap' => $row->thu_tu_trong_cap,
                    'gia' => $row->gia,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                $monLopToMonhoc[$row->mon_lop_id] = $monhocId;
            }

            DB::table('monhoc')->whereNull('cap_hoc_id')->delete();
        }

        if (! Schema::hasTable('giasu_mon')) {
            Schema::create('giasu_mon', function (Blueprint $table) {
                $table->id();
                $table->foreignId('giasu_id')->constrained('giasu')->onDelete('cascade');
                $table->foreignId('monhoc_id')->constrained('monhoc')->onDelete('cascade');
                $table->decimal('gia', 10, 2);
                $table->timestamps();

                $table->unique(['giasu_id', 'monhoc_id']);
            });
        }

        if (Schema::hasTable('giasu_mon_lop') && ! empty($monLopToMonhoc)) {
            $giasuMonLops = DB::table('giasu_mon_lop')->get();
            $now = now();

            foreach ($giasuMonLops as $row) {
                $monhocId = $monLopToMonhoc[$row->mon_lop_id] ?? null;
                if (! $monhocId) {
                    continue;
                }

                $monhoc = DB::table('monhoc')->where('id', $monhocId)->first();
                $giasu = DB::table('giasu')->where('id', $row->giasu_id)->first();
                $trinhDo = $giasu?->trinh_do_giasu_id
                    ? DB::table('trinh_do_giasu')->where('id', $giasu->trinh_do_giasu_id)->first()
                    : null;

                $gia = (float) ($monhoc->gia ?? 0) + (float) ($trinhDo->gia_cong_them ?? 0);

                DB::table('giasu_mon')->updateOrInsert(
                    ['giasu_id' => $row->giasu_id, 'monhoc_id' => $monhocId],
                    [
                        'giasu_id' => $row->giasu_id,
                        'monhoc_id' => $monhocId,
                        'gia' => $gia,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]
                );
            }
        }

        if (Schema::hasTable('goihoc')) {
            if (Schema::hasColumn('goihoc', 'mon_lop_id') && ! empty($monLopToMonhoc)) {
                foreach ($monLopToMonhoc as $monLopId => $monhocId) {
                    DB::table('goihoc')
                        ->where('mon_lop_id', $monLopId)
                        ->update(['monhoc_id' => $monhocId]);
                }
            }

            if (Schema::hasColumn('goihoc', 'mon_lop_id')) {
                $this->dropForeignIfExists('goihoc', 'mon_lop_id');
                Schema::table('goihoc', function (Blueprint $table) {
                    $table->dropColumn('mon_lop_id');
                });
            }

            if (Schema::hasColumn('goihoc', 'lop_id')) {
                $this->dropForeignIfExists('goihoc', 'lop_id');
                Schema::table('goihoc', function (Blueprint $table) {
                    $table->dropColumn('lop_id');
                });
            }
        }

        Schema::dropIfExists('cau_hinh_gia');
        Schema::dropIfExists('giasu_mon_lop');
        Schema::dropIfExists('mon_lop');
        Schema::dropIfExists('lop');

        DB::table('monhoc')->whereNull('cap_hoc_id')->delete();

        if (Schema::hasColumn('monhoc', 'cap_hoc_id')) {
            $hasUnique = collect(DB::select('SHOW INDEX FROM monhoc'))
                ->pluck('Key_name')
                ->contains('monhoc_cap_ten_lop_unique');

            if (! $hasUnique) {
                Schema::table('monhoc', function (Blueprint $table) {
                    $table->unique(['cap_hoc_id', 'ten_mon', 'so_lop'], 'monhoc_cap_ten_lop_unique');
                });
            }
        }

        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
        // Không rollback tự động vì đã gộp dữ liệu và xóa bảng cũ.
    }
};

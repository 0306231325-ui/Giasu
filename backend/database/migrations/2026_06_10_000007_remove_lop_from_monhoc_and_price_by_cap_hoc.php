<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private function dropIndexIfExists(string $table, string $indexName): void
    {
        $exists = collect(DB::select("SHOW INDEX FROM `{$table}`"))
            ->pluck('Key_name')
            ->contains($indexName);

        if ($exists) {
            DB::statement("ALTER TABLE `{$table}` DROP INDEX `{$indexName}`");
        }
    }

    public function up(): void
    {
        if (! Schema::hasTable('monhoc') || ! Schema::hasColumn('monhoc', 'so_lop')) {
            return;
        }

        Schema::disableForeignKeyConstraints();

        $groups = DB::table('monhoc')
            ->join('cap_hoc', 'cap_hoc.id', '=', 'monhoc.cap_hoc_id')
            ->select(
                'monhoc.cap_hoc_id',
                'monhoc.ten_mon',
                'cap_hoc.ten as ten_cap_hoc',
                'cap_hoc.thu_tu as thu_tu_cap',
                DB::raw('MIN(monhoc.id) as keep_id'),
                DB::raw('MIN(monhoc.gia) as gia_theo_cap')
            )
            ->whereNotNull('monhoc.cap_hoc_id')
            ->groupBy('monhoc.cap_hoc_id', 'monhoc.ten_mon', 'cap_hoc.ten', 'cap_hoc.thu_tu')
            ->get();

        $giaGocTheoMon = DB::table('monhoc')
            ->select('ten_mon', DB::raw('MIN(gia) as gia_goc'))
            ->groupBy('ten_mon')
            ->pluck('gia_goc', 'ten_mon');

        foreach ($groups as $group) {
            $giaTheoCap = (float) ($giaGocTheoMon[$group->ten_mon] ?? $group->gia_theo_cap)
                + max(0, ((int) $group->thu_tu_cap) - 1) * 100000;

            DB::table('monhoc')
                ->where('id', $group->keep_id)
                ->update([
                    'gia' => $giaTheoCap,
                    'mo_ta' => $group->ten_mon . ' - ' . $group->ten_cap_hoc,
                ]);

            $duplicateIds = DB::table('monhoc')
                ->where('cap_hoc_id', $group->cap_hoc_id)
                ->where('ten_mon', $group->ten_mon)
                ->where('id', '!=', $group->keep_id)
                ->pluck('id');

            foreach ($duplicateIds as $duplicateId) {
                if (Schema::hasTable('giasu_gia')) {
                    $giasuGiaRows = DB::table('giasu_gia')
                        ->where('monhoc_id', $duplicateId)
                        ->get();

                    foreach ($giasuGiaRows as $row) {
                        $exists = DB::table('giasu_gia')
                            ->where('giasu_id', $row->giasu_id)
                            ->where('monhoc_id', $group->keep_id)
                            ->exists();

                        if ($exists) {
                            DB::table('giasu_gia')->where('id', $row->id)->delete();
                        } else {
                            DB::table('giasu_gia')->where('id', $row->id)->update([
                                'monhoc_id' => $group->keep_id,
                                'gia_mon' => $giaTheoCap,
                                'tong_gia' => $giaTheoCap + (float) $row->gia_cong_them,
                            ]);
                        }
                    }
                }

                if (Schema::hasTable('goihoc')) {
                    DB::table('goihoc')
                        ->where('monhoc_id', $duplicateId)
                        ->update(['monhoc_id' => $group->keep_id]);
                }
            }

            if ($duplicateIds->isNotEmpty()) {
                DB::table('monhoc')->whereIn('id', $duplicateIds)->delete();
            }
        }

        if (Schema::hasTable('giasu_gia')) {
            DB::table('giasu_gia')
                ->join('monhoc', 'monhoc.id', '=', 'giasu_gia.monhoc_id')
                ->update([
                    'giasu_gia.gia_mon' => DB::raw('monhoc.gia'),
                    'giasu_gia.tong_gia' => DB::raw('monhoc.gia + giasu_gia.gia_cong_them'),
                ]);
        }

        $this->dropIndexIfExists('monhoc', 'monhoc_cap_ten_lop_unique');
        $this->dropIndexIfExists('monhoc', 'monhoc_cap_ten_unique');

        foreach (['so_lop', 'thu_tu_trong_cap'] as $column) {
            if (Schema::hasColumn('monhoc', $column)) {
                Schema::table('monhoc', function (Blueprint $table) use ($column) {
                    $table->dropColumn($column);
                });
            }
        }

        Schema::table('monhoc', function (Blueprint $table) {
            $table->unique(['cap_hoc_id', 'ten_mon'], 'monhoc_cap_ten_unique');
        });

        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
        if (! Schema::hasTable('monhoc') || Schema::hasColumn('monhoc', 'so_lop')) {
            return;
        }

        Schema::table('monhoc', function (Blueprint $table) {
            $table->unsignedTinyInteger('so_lop')->nullable()->after('cap_hoc_id');
            $table->unsignedTinyInteger('thu_tu_trong_cap')->nullable()->after('so_lop');
        });

        DB::table('monhoc')->update([
            'so_lop' => 1,
            'thu_tu_trong_cap' => 1,
        ]);

        $this->dropIndexIfExists('monhoc', 'monhoc_cap_ten_unique');

        Schema::table('monhoc', function (Blueprint $table) {
            $table->unique(['cap_hoc_id', 'ten_mon', 'so_lop'], 'monhoc_cap_ten_lop_unique');
        });
    }
};

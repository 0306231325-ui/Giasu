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
        if (Schema::hasTable('goihoc')) {
            if (! Schema::hasColumn('goihoc', 'thu')) {
                Schema::table('goihoc', function (Blueprint $table) {
                    $table->tinyInteger('thu')->nullable()->after('hoc_dinhky');
                });
            }

            if (! Schema::hasColumn('goihoc', 'gio_batdau')) {
                Schema::table('goihoc', function (Blueprint $table) {
                    $table->time('gio_batdau')->nullable()->after('thu');
                });
            }

            if (! Schema::hasColumn('goihoc', 'gio_ketthuc')) {
                Schema::table('goihoc', function (Blueprint $table) {
                    $table->time('gio_ketthuc')->nullable()->after('gio_batdau');
                });
            }
        }

        if (Schema::hasTable('goihoc') && Schema::hasTable('goihoc_lich_dinhky')) {
            $lichDinhKys = DB::table('goihoc_lich_dinhky')
                ->select('goihoc_id', DB::raw('MIN(id) as id'))
                ->groupBy('goihoc_id');

            DB::table('goihoc')
                ->joinSub($lichDinhKys, 'lich_dinhky_dau', function ($join) {
                    $join->on('goihoc.id', '=', 'lich_dinhky_dau.goihoc_id');
                })
                ->join('goihoc_lich_dinhky', 'goihoc_lich_dinhky.id', '=', 'lich_dinhky_dau.id')
                ->update([
                    'goihoc.thu' => DB::raw('goihoc_lich_dinhky.thu'),
                    'goihoc.gio_batdau' => DB::raw('goihoc_lich_dinhky.gio_batdau'),
                    'goihoc.gio_ketthuc' => DB::raw('goihoc_lich_dinhky.gio_ketthuc'),
                ]);
        }

        if (Schema::hasTable('lichhoc') && Schema::hasColumn('lichhoc', 'goihoc_lich_dinhky_id')) {
            $this->dropForeignIfExists('lichhoc', 'goihoc_lich_dinhky_id');

            Schema::table('lichhoc', function (Blueprint $table) {
                $table->dropColumn('goihoc_lich_dinhky_id');
            });
        }

        Schema::dropIfExists('goihoc_lich_dinhky');
    }

    public function down(): void
    {
        if (! Schema::hasTable('goihoc_lich_dinhky')) {
            Schema::create('goihoc_lich_dinhky', function (Blueprint $table) {
                $table->id();
                $table->foreignId('goihoc_id')->constrained('goihoc')->onDelete('cascade');
                $table->tinyInteger('thu');
                $table->time('gio_batdau');
                $table->time('gio_ketthuc');
                $table->timestamps();

                $table->unique(['goihoc_id', 'thu', 'gio_batdau', 'gio_ketthuc']);
            });
        }

        if (Schema::hasTable('goihoc')) {
            $now = now();
            $goiHocs = DB::table('goihoc')
                ->whereNotNull('thu')
                ->whereNotNull('gio_batdau')
                ->whereNotNull('gio_ketthuc')
                ->get(['id', 'thu', 'gio_batdau', 'gio_ketthuc']);

            foreach ($goiHocs as $goiHoc) {
                DB::table('goihoc_lich_dinhky')->updateOrInsert(
                    [
                        'goihoc_id' => $goiHoc->id,
                        'thu' => $goiHoc->thu,
                        'gio_batdau' => $goiHoc->gio_batdau,
                        'gio_ketthuc' => $goiHoc->gio_ketthuc,
                    ],
                    [
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]
                );
            }

            foreach (['gio_ketthuc', 'gio_batdau', 'thu'] as $column) {
                if (Schema::hasColumn('goihoc', $column)) {
                    Schema::table('goihoc', function (Blueprint $table) use ($column) {
                        $table->dropColumn($column);
                    });
                }
            }
        }
    }
};

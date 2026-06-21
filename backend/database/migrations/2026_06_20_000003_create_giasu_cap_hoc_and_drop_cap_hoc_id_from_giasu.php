<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('giasu_cap_hoc')) {
            Schema::create('giasu_cap_hoc', function (Blueprint $table) {
                $table->id();
                $table->foreignId('giasu_id')
                    ->constrained('giasu')
                    ->cascadeOnDelete();
                $table->foreignId('cap_hoc_id')
                    ->constrained('cap_hoc')
                    ->cascadeOnDelete();
                $table->timestamps();

                $table->unique(
                    ['giasu_id', 'cap_hoc_id'],
                    'giasu_cap_hoc_giasu_cap_unique',
                );
            });
        }

        if (Schema::hasColumn('giasu', 'cap_hoc_id')) {
            $now = now();

            DB::table('giasu')
                ->whereNotNull('cap_hoc_id')
                ->orderBy('id')
                ->get(['id', 'cap_hoc_id'])
                ->each(function ($giaSu) use ($now) {
                    DB::table('giasu_cap_hoc')->updateOrInsert(
                        [
                            'giasu_id' => $giaSu->id,
                            'cap_hoc_id' => $giaSu->cap_hoc_id,
                        ],
                        [
                            'created_at' => $now,
                            'updated_at' => $now,
                        ],
                    );
                });

            Schema::table('giasu', function (Blueprint $table) {
                $table->dropConstrainedForeignId('cap_hoc_id');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('giasu', 'cap_hoc_id')) {
            Schema::table('giasu', function (Blueprint $table) {
                $table->foreignId('cap_hoc_id')
                    ->nullable()
                    ->after('hoc_van')
                    ->constrained('cap_hoc')
                    ->nullOnDelete();
            });
        }

        if (Schema::hasTable('giasu_cap_hoc')) {
            $capHocDauTien = DB::table('giasu_cap_hoc')
                ->select('giasu_id', DB::raw('MIN(cap_hoc_id) as cap_hoc_id'))
                ->groupBy('giasu_id')
                ->get();

            foreach ($capHocDauTien as $quanHe) {
                DB::table('giasu')
                    ->where('id', $quanHe->giasu_id)
                    ->update(['cap_hoc_id' => $quanHe->cap_hoc_id]);
            }

            Schema::drop('giasu_cap_hoc');
        }
    }
};

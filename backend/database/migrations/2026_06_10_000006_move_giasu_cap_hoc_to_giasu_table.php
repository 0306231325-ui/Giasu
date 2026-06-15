<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('giasu') && ! Schema::hasColumn('giasu', 'cap_hoc_id')) {
            Schema::table('giasu', function (Blueprint $table) {
                $table->foreignId('cap_hoc_id')
                    ->nullable()
                    ->after('hoc_van')
                    ->constrained('cap_hoc')
                    ->nullOnDelete();
            });
        }

        if (Schema::hasTable('giasu') && Schema::hasTable('giasu_cap_hoc')) {
            $capHocDauTien = DB::table('giasu_cap_hoc')
                ->select('giasu_id', DB::raw('MIN(id) as id'))
                ->groupBy('giasu_id');

            DB::table('giasu')
                ->joinSub($capHocDauTien, 'cap_hoc_dau_tien', function ($join) {
                    $join->on('giasu.id', '=', 'cap_hoc_dau_tien.giasu_id');
                })
                ->join('giasu_cap_hoc', 'giasu_cap_hoc.id', '=', 'cap_hoc_dau_tien.id')
                ->update([
                    'giasu.cap_hoc_id' => DB::raw('giasu_cap_hoc.cap_hoc_id'),
                ]);
        }

        Schema::dropIfExists('giasu_cap_hoc');
    }

    public function down(): void
    {
        if (! Schema::hasTable('giasu_cap_hoc')) {
            Schema::create('giasu_cap_hoc', function (Blueprint $table) {
                $table->id();
                $table->foreignId('giasu_id')->constrained('giasu')->onDelete('cascade');
                $table->foreignId('cap_hoc_id')->constrained('cap_hoc')->onDelete('cascade');
                $table->timestamps();

                $table->unique(['giasu_id', 'cap_hoc_id']);
            });
        }

        if (Schema::hasTable('giasu') && Schema::hasColumn('giasu', 'cap_hoc_id')) {
            $now = now();
            $giasus = DB::table('giasu')
                ->whereNotNull('cap_hoc_id')
                ->get(['id', 'cap_hoc_id']);

            foreach ($giasus as $giasu) {
                DB::table('giasu_cap_hoc')->updateOrInsert(
                    [
                        'giasu_id' => $giasu->id,
                        'cap_hoc_id' => $giasu->cap_hoc_id,
                    ],
                    [
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]
                );
            }

            Schema::table('giasu', function (Blueprint $table) {
                $table->dropConstrainedForeignId('cap_hoc_id');
            });
        }
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('goihoc') && ! Schema::hasColumn('goihoc', 'chietkhau_id')) {
            Schema::table('goihoc', function (Blueprint $table) {
                $table->foreignId('chietkhau_id')
                    ->nullable()
                    ->after('monhoc_id')
                    ->constrained('chietkhau')
                    ->nullOnDelete();
            });
        }

        if (Schema::hasTable('lichhoc') && ! Schema::hasColumn('lichhoc', 'da_giam')) {
            Schema::table('lichhoc', function (Blueprint $table) {
                $table->decimal('da_giam', 5, 2)->default(0)->after('tien_hoc');
            });
        }

        if (Schema::hasTable('goihoc') && Schema::hasTable('chietkhau') && Schema::hasColumn('goihoc', 'chietkhau_id')) {
            $goiHocs = DB::table('goihoc')->whereNull('chietkhau_id')->get(['id', 'so_buoi']);

            foreach ($goiHocs as $goiHoc) {
                $chietKhauId = DB::table('chietkhau')
                    ->where('so_buoi', '<=', $goiHoc->so_buoi)
                    ->orderByDesc('so_buoi')
                    ->value('id');

                if ($chietKhauId) {
                    DB::table('goihoc')
                        ->where('id', $goiHoc->id)
                        ->update(['chietkhau_id' => $chietKhauId]);
                }
            }
        }

        if (Schema::hasTable('lichhoc') && Schema::hasColumn('lichhoc', 'da_giam')) {
            DB::table('lichhoc')
                ->join('goihoc', 'goihoc.id', '=', 'lichhoc.goihoc_id')
                ->leftJoin('chietkhau', 'chietkhau.id', '=', 'goihoc.chietkhau_id')
                ->update([
                    'lichhoc.da_giam' => DB::raw('COALESCE(chietkhau.phan_tram_giam, 0)'),
                ]);
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('lichhoc') && Schema::hasColumn('lichhoc', 'da_giam')) {
            Schema::table('lichhoc', function (Blueprint $table) {
                $table->dropColumn('da_giam');
            });
        }

        if (Schema::hasTable('goihoc') && Schema::hasColumn('goihoc', 'chietkhau_id')) {
            Schema::table('goihoc', function (Blueprint $table) {
                $table->dropConstrainedForeignId('chietkhau_id');
            });
        }
    }
};

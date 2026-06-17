<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('goihoc') && ! Schema::hasColumn('goihoc', 'loai_goi_id')) {
            Schema::table('goihoc', function (Blueprint $table) {
                $table->foreignId('loai_goi_id')
                    ->nullable()
                    ->after('monhoc_id')
                    ->constrained('loai_goi')
                    ->nullOnDelete();
            });
        }

        if (Schema::hasTable('lichhoc') && ! Schema::hasColumn('lichhoc', 'da_giam')) {
            Schema::table('lichhoc', function (Blueprint $table) {
                $table->decimal('da_giam', 5, 2)->default(0)->after('tien_hoc');
            });
        }

        if (Schema::hasTable('goihoc') && Schema::hasTable('loai_goi') && Schema::hasColumn('goihoc', 'loai_goi_id')) {
            $goiHocs = DB::table('goihoc')->whereNull('loai_goi_id')->get(['id', 'ngay_batdau', 'ngay_ketthuc']);

            foreach ($goiHocs as $goiHoc) {
                $soThang = max(1, (int) ceil(abs(strtotime($goiHoc->ngay_ketthuc) - strtotime($goiHoc->ngay_batdau)) / 2592000));
                $loaiGoiId = DB::table('loai_goi')
                    ->where('so_thang', '<=', $soThang)
                    ->orderByDesc('so_thang')
                    ->value('id');

                if ($loaiGoiId) {
                    DB::table('goihoc')
                        ->where('id', $goiHoc->id)
                        ->update(['loai_goi_id' => $loaiGoiId]);
                }
            }
        }

        if (Schema::hasTable('lichhoc') && Schema::hasColumn('lichhoc', 'da_giam')) {
            DB::table('lichhoc')
                ->join('goihoc', 'goihoc.id', '=', 'lichhoc.goihoc_id')
                ->leftJoin('loai_goi', 'loai_goi.id', '=', 'goihoc.loai_goi_id')
                ->update([
                    'lichhoc.da_giam' => DB::raw('COALESCE(loai_goi.phan_tram_giam, 0)'),
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

        if (Schema::hasTable('goihoc') && Schema::hasColumn('goihoc', 'loai_goi_id')) {
            Schema::table('goihoc', function (Blueprint $table) {
                $table->dropConstrainedForeignId('loai_goi_id');
            });
        }
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('monhoc') || ! Schema::hasColumn('monhoc', 'gia')) {
            return;
        }

        $giaGocTheoMon = DB::table('monhoc')
            ->select('ten_mon', DB::raw('MIN(gia) as gia_goc'))
            ->groupBy('ten_mon')
            ->pluck('gia_goc', 'ten_mon');

        $monHocs = DB::table('monhoc')
            ->join('cap_hoc', 'cap_hoc.id', '=', 'monhoc.cap_hoc_id')
            ->select('monhoc.id', 'monhoc.ten_mon', 'cap_hoc.thu_tu')
            ->get();

        foreach ($monHocs as $monHoc) {
            $giaTheoCap = (float) ($giaGocTheoMon[$monHoc->ten_mon] ?? 0)
                + max(0, ((int) $monHoc->thu_tu) - 1) * 100000;

            DB::table('monhoc')
                ->where('id', $monHoc->id)
                ->update(['gia' => $giaTheoCap]);
        }

        if (Schema::hasTable('giasu_gia')) {
            DB::table('giasu_gia')
                ->join('monhoc', 'monhoc.id', '=', 'giasu_gia.monhoc_id')
                ->update([
                    'giasu_gia.gia_mon' => DB::raw('monhoc.gia'),
                    'giasu_gia.tong_gia' => DB::raw('monhoc.gia + giasu_gia.gia_cong_them'),
                ]);
        }
    }

    public function down(): void
    {
        // Không rollback tự động vì migration này chỉ chuẩn hóa lại giá hiện tại.
    }
};

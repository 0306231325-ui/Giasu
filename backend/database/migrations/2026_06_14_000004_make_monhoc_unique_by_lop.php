<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $lopMacDinh = [
            'tieu_hoc' => 'Lớp 5',
            'thcs' => 'Lớp 9',
            'thpt' => 'Lớp 12',
            'cao_dang' => 'Năm 2',
            'dai_hoc' => 'Năm 4',
        ];

        foreach ($lopMacDinh as $maCap => $lop) {
            DB::table('monhoc')
                ->join('cap_hoc', 'cap_hoc.id', '=', 'monhoc.cap_hoc_id')
                ->where('cap_hoc.ma', $maCap)
                ->whereNull('monhoc.lop')
                ->update(['monhoc.lop' => $lop]);
        }

        Schema::table('monhoc', function (Blueprint $table) {
            $table->index('cap_hoc_id', 'monhoc_cap_hoc_id_index');
            $table->dropUnique('monhoc_cap_ten_unique');
            $table->unique(['cap_hoc_id', 'ten_mon', 'lop'], 'monhoc_cap_ten_lop_unique');
        });
    }

    public function down(): void
    {
        Schema::table('monhoc', function (Blueprint $table) {
            $table->dropUnique('monhoc_cap_ten_lop_unique');
            $table->dropIndex('monhoc_cap_hoc_id_index');
        });
    }
};

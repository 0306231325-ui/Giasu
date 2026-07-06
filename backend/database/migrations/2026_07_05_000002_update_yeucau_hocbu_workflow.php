<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE yeucau_hocbu MODIFY trang_thai ENUM('cho_duyet','cho_gia_su_xac_nhan','giasu_dong_y','giasu_tu_choi','da_duyet','tu_choi') NOT NULL DEFAULT 'cho_duyet'");
    }

    public function down(): void
    {
        DB::table('yeucau_hocbu')
            ->whereIn('trang_thai', ['cho_gia_su_xac_nhan', 'giasu_dong_y', 'giasu_tu_choi'])
            ->update(['trang_thai' => 'cho_duyet']);

        DB::statement("ALTER TABLE yeucau_hocbu MODIFY trang_thai ENUM('cho_duyet','da_duyet','tu_choi') NOT NULL DEFAULT 'cho_duyet'");
    }
};

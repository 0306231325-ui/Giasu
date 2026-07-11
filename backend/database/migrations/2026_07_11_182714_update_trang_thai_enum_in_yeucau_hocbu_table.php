<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE yeucau_hocbu MODIFY trang_thai ENUM('cho_duyet','cho_gia_su_xac_nhan','giasu_dong_y','giasu_tu_choi','da_duyet','tu_choi','cho_hoc_vien_xac_nhan','hoc_vien_tu_choi') NOT NULL DEFAULT 'cho_duyet'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE yeucau_hocbu MODIFY trang_thai ENUM('cho_duyet','cho_gia_su_xac_nhan','giasu_dong_y','giasu_tu_choi','da_duyet','tu_choi') NOT NULL DEFAULT 'cho_duyet'");
    }
};

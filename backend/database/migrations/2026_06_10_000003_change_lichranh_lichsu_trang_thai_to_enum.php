<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql' || ! Schema::hasColumn('lichranh_lichsu', 'trang_thai')) {
            return;
        }

        DB::statement("UPDATE `lichranh_lichsu` SET `trang_thai` = NULL WHERE `trang_thai` NOT IN ('ranh', 'ban')");
        DB::statement("ALTER TABLE `lichranh_lichsu` MODIFY `trang_thai` ENUM('ranh', 'ban') NULL");
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql' || ! Schema::hasColumn('lichranh_lichsu', 'trang_thai')) {
            return;
        }

        DB::statement('ALTER TABLE `lichranh_lichsu` MODIFY `trang_thai` VARCHAR(50) NULL');
    }
};

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
        if (Schema::hasTable('lichhoc')) {
            $this->dropForeignIfExists('lichhoc', 'lichhoc_goc_id');

            Schema::table('lichhoc', function (Blueprint $table) {
                $cols = ['loai_buoi', 'lichhoc_goc_id', 'don_gia_buoi', 'ben_huy', 'du_an_huy', 'ket_qua_huy'];
                foreach ($cols as $col) {
                    if (Schema::hasColumn('lichhoc', $col)) {
                        $table->dropColumn($col);
                    }
                }
            });
        }

        if (Schema::hasTable('lichhoc_lichsu')) {
            $this->dropForeignIfExists('lichhoc_lichsu', 'goihoc_id');
            $this->dropForeignIfExists('lichhoc_lichsu', 'lichhoc_lien_quan_id');

            Schema::table('lichhoc_lichsu', function (Blueprint $table) {
                $cols = [
                    'goihoc_id', 'lichhoc_lien_quan_id', 'loai_su_kien',
                    'ngay_hoc_cu', 'gio_batdau_cu', 'gio_ketthuc_cu',
                    'ngay_hoc_moi', 'gio_batdau_moi', 'gio_ketthuc_moi',
                    'ben_thuc_hien', 'thoi_diem_buoi_hoc', 'thoi_diem_thao_tac',
                    'so_gio_truoc_buoi', 'du_an_huy', 'ket_qua_xu_ly', 'so_tien_hoan',
                ];
                foreach ($cols as $col) {
                    if (Schema::hasColumn('lichhoc_lichsu', $col)) {
                        $table->dropColumn($col);
                    }
                }
            });
        }

        if (Schema::hasTable('lichranh_lichsu')) {
            Schema::table('lichranh_lichsu', function (Blueprint $table) {
                $cols = [
                    'loai_su_kien', 'thu_cu', 'gio_batdau_cu', 'gio_ketthuc_cu', 'trang_thai_cu',
                    'thu_moi', 'gio_batdau_moi', 'gio_ketthuc_moi', 'trang_thai_moi', 'ghi_chu',
                ];
                foreach ($cols as $col) {
                    if (Schema::hasColumn('lichranh_lichsu', $col)) {
                        $table->dropColumn($col);
                    }
                }
            });
        }
    }

    public function down(): void
    {
        // Không khôi phục — đây là migration revert có chủ đích.
    }
};

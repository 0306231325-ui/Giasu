<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Dọn dữ liệu cũ theo mô hình (mon+cap) để không dính unique(monhoc_id).
        // Giữ lại bản ghi của cấp tiểu học (tieu_hoc) làm gốc.
        if (Schema::hasTable('bang_gia_goc') && Schema::hasColumn('bang_gia_goc', 'cap_hoc_id')) {
            $tieuHocId = \DB::table('cap_hoc')->where('ma', 'tieu_hoc')->value('id');
            if ($tieuHocId) {
                \DB::table('bang_gia_goc')->where('cap_hoc_id', '!=', $tieuHocId)->delete();
            }
        }

        // bang_gia_goc: chuyển từ (mon + cap) -> chỉ còn (mon)
        if (Schema::hasTable('bang_gia_goc') && Schema::hasColumn('bang_gia_goc', 'cap_hoc_id')) {
            Schema::disableForeignKeyConstraints();

            Schema::table('bang_gia_goc', function (Blueprint $table) {
                $table->dropUnique(['monhoc_id', 'cap_hoc_id']);
                $table->dropForeign(['cap_hoc_id']);
                $table->dropColumn('cap_hoc_id');
            });

            Schema::table('bang_gia_goc', function (Blueprint $table) {
                $table->unique(['monhoc_id']);
            });

            Schema::enableForeignKeyConstraints();
        }

        // cau_hinh_gia: seed mặc định tăng theo cấp nếu chưa có
        if (Schema::hasTable('cau_hinh_gia')) {
            $now = now();
            \DB::table('cau_hinh_gia')->updateOrInsert(
                ['ma' => 'tang_theo_cap'],
                [
                    'ma' => 'tang_theo_cap',
                    'gia_tri' => 100000,
                    'mo_ta' => 'Mức cộng thêm mỗi cấp học (Tiểu -> THCS -> THPT ...)',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
    }

    public function down(): void
    {
        // Không rollback tự động về (mon+cap) vì sẽ mất dữ liệu (đã gộp).
        // Nếu cần, tạo migration riêng để phục hồi.
    }
};


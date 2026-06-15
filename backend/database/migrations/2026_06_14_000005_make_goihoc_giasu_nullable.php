<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private function dropForeignKey(): void
    {
        $constraints = DB::select(
            'SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?
             AND REFERENCED_TABLE_NAME IS NOT NULL',
            ['goihoc', 'giasu_id']
        );

        foreach ($constraints as $constraint) {
            DB::statement("ALTER TABLE `goihoc` DROP FOREIGN KEY `{$constraint->CONSTRAINT_NAME}`");
        }
    }

    public function up(): void
    {
        $this->dropForeignKey();

        DB::statement('ALTER TABLE `goihoc` MODIFY `giasu_id` BIGINT UNSIGNED NULL');
        DB::statement(
            'ALTER TABLE `goihoc` ADD CONSTRAINT `goihoc_giasu_id_foreign`
             FOREIGN KEY (`giasu_id`) REFERENCES `giasu` (`id`) ON DELETE SET NULL'
        );
    }

    public function down(): void
    {
        if (DB::table('goihoc')->whereNull('giasu_id')->exists()) {
            throw new RuntimeException('Không thể rollback khi còn gói học chưa có gia sư.');
        }

        $this->dropForeignKey();

        DB::statement('ALTER TABLE `goihoc` MODIFY `giasu_id` BIGINT UNSIGNED NOT NULL');
        DB::statement(
            'ALTER TABLE `goihoc` ADD CONSTRAINT `goihoc_giasu_id_foreign`
             FOREIGN KEY (`giasu_id`) REFERENCES `giasu` (`id`) ON DELETE CASCADE'
        );
    }
};

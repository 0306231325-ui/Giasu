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
        if (Schema::hasTable('giasu_mon') && ! Schema::hasTable('giasu_gia')) {
            Schema::rename('giasu_mon', 'giasu_gia');
        }

        if (! Schema::hasTable('giasu_gia')) {
            Schema::create('giasu_gia', function (Blueprint $table) {
                $table->id();
                $table->foreignId('giasu_id')->constrained('giasu')->onDelete('cascade');
                $table->foreignId('monhoc_id')->constrained('monhoc')->onDelete('cascade');
                $table->foreignId('trinh_do_giasu_id')->nullable()->constrained('trinh_do_giasu')->nullOnDelete();
                $table->decimal('gia_mon', 10, 2);
                $table->decimal('gia_cong_them', 10, 2)->default(0);
                $table->decimal('tong_gia', 10, 2);
                $table->timestamps();

                $table->unique(['giasu_id', 'monhoc_id']);
            });

            return;
        }

        if (! Schema::hasColumn('giasu_gia', 'gia_mon')) {
            Schema::table('giasu_gia', function (Blueprint $table) {
                $table->foreignId('trinh_do_giasu_id')->nullable()->after('monhoc_id')->constrained('trinh_do_giasu')->nullOnDelete();
                $table->decimal('gia_mon', 10, 2)->nullable()->after('trinh_do_giasu_id');
                $table->decimal('gia_cong_them', 10, 2)->default(0)->after('gia_mon');
                $table->decimal('tong_gia', 10, 2)->nullable()->after('gia_cong_them');
            });
        }

        $rows = DB::table('giasu_gia')->get();

        foreach ($rows as $row) {
            $monhoc = DB::table('monhoc')->where('id', $row->monhoc_id)->first();
            $giasu = DB::table('giasu')->where('id', $row->giasu_id)->first();
            $trinhDo = $giasu?->trinh_do_giasu_id
                ? DB::table('trinh_do_giasu')->where('id', $giasu->trinh_do_giasu_id)->first()
                : null;

            $giaMon = (float) ($monhoc->gia ?? 0);
            $giaCongThem = (float) ($trinhDo->gia_cong_them ?? 0);
            $tongGia = $giaMon + $giaCongThem;

            if (Schema::hasColumn('giasu_gia', 'gia') && $row->gia !== null) {
                $tongGia = (float) $row->gia;
            }

            DB::table('giasu_gia')->where('id', $row->id)->update([
                'trinh_do_giasu_id' => $giasu?->trinh_do_giasu_id,
                'gia_mon' => $giaMon,
                'gia_cong_them' => $giaCongThem,
                'tong_gia' => $tongGia,
            ]);
        }

        if (Schema::hasColumn('giasu_gia', 'gia')) {
            Schema::table('giasu_gia', function (Blueprint $table) {
                $table->dropColumn('gia');
            });
        }

        DB::statement('ALTER TABLE `giasu_gia` MODIFY `gia_mon` DECIMAL(10,2) NOT NULL');
        DB::statement('ALTER TABLE `giasu_gia` MODIFY `tong_gia` DECIMAL(10,2) NOT NULL');
    }

    public function down(): void
    {
        if (! Schema::hasTable('giasu_gia')) {
            return;
        }

        if (! Schema::hasColumn('giasu_gia', 'gia')) {
            Schema::table('giasu_gia', function (Blueprint $table) {
                $table->decimal('gia', 10, 2)->nullable()->after('monhoc_id');
            });

            DB::table('giasu_gia')->update(['gia' => DB::raw('tong_gia')]);
        }

        if (Schema::hasColumn('giasu_gia', 'trinh_do_giasu_id')) {
            $this->dropForeignIfExists('giasu_gia', 'trinh_do_giasu_id');
            Schema::table('giasu_gia', function (Blueprint $table) {
                $table->dropColumn(['trinh_do_giasu_id', 'gia_mon', 'gia_cong_them', 'tong_gia']);
            });
        }

        Schema::rename('giasu_gia', 'giasu_mon');
    }
};

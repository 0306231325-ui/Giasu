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

    private function syncLichRanhLichSuTrangThaiEnum(): void
    {
        if (DB::getDriverName() !== 'mysql' || ! Schema::hasColumn('lichranh_lichsu', 'trang_thai')) {
            return;
        }

        DB::statement("UPDATE `lichranh_lichsu` SET `trang_thai` = NULL WHERE `trang_thai` NOT IN ('ranh', 'ban')");
        DB::statement("ALTER TABLE `lichranh_lichsu` MODIFY `trang_thai` ENUM('ranh', 'ban') NULL");
    }

    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        if (! Schema::hasTable('lichhoc_lichsu')) {
            Schema::create('lichhoc_lichsu', function (Blueprint $table) {
                $table->id();
                $table->foreignId('lichhoc_id')->constrained('lichhoc')->onDelete('cascade');
                $table->foreignId('nguoi_thay_doi_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('trang_thai_cu', 50)->nullable();
                $table->string('trang_thai_moi', 50)->nullable();
                $table->timestamps();
            });
        } else {
            if (! Schema::hasColumn('lichhoc_lichsu', 'lichhoc_id')) {
                Schema::table('lichhoc_lichsu', function (Blueprint $table) {
                    $table->foreignId('lichhoc_id')->after('id')->constrained('lichhoc')->onDelete('cascade');
                });
            }

            if (! Schema::hasColumn('lichhoc_lichsu', 'nguoi_thay_doi_id')) {
                Schema::table('lichhoc_lichsu', function (Blueprint $table) {
                    $table->foreignId('nguoi_thay_doi_id')->nullable()->after('lichhoc_id')->constrained('users')->nullOnDelete();
                });
            }

            foreach (['trang_thai_cu', 'trang_thai_moi'] as $column) {
                if (! Schema::hasColumn('lichhoc_lichsu', $column)) {
                    Schema::table('lichhoc_lichsu', function (Blueprint $table) use ($column) {
                        $table->string($column, 50)->nullable();
                    });
                }
            }

            Schema::table('lichhoc_lichsu', function (Blueprint $table) {
                $columns = [
                    'hanh_dong', 'du_lieu_cu', 'du_lieu_moi', 'ghi_chu',
                    'goihoc_id', 'lichhoc_lien_quan_id', 'loai_su_kien',
                    'ngay_hoc_cu', 'gio_batdau_cu', 'gio_ketthuc_cu',
                    'ngay_hoc_moi', 'gio_batdau_moi', 'gio_ketthuc_moi',
                    'ben_thuc_hien', 'thoi_diem_buoi_hoc', 'thoi_diem_thao_tac',
                    'so_gio_truoc_buoi', 'du_an_huy', 'ket_qua_xu_ly', 'so_tien_hoan',
                ];

                foreach ($columns as $column) {
                    if (Schema::hasColumn('lichhoc_lichsu', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }

        if (! Schema::hasTable('lichranh_lichsu')) {
            Schema::create('lichranh_lichsu', function (Blueprint $table) {
                $table->id();
                $table->foreignId('lichranh_id')->nullable()->constrained('lichranh')->nullOnDelete();
                $table->tinyInteger('thu')->nullable();
                $table->time('gio_batdau')->nullable();
                $table->time('gio_ketthuc')->nullable();
                $table->enum('trang_thai', ['ranh', 'ban'])->nullable();
                $table->timestamps();
            });
        } else {
            $this->dropForeignIfExists('lichranh_lichsu', 'giasu_id');
            $this->dropForeignIfExists('lichranh_lichsu', 'nguoi_thay_doi_id');

            foreach ([
                'thu' => fn (Blueprint $table) => $table->tinyInteger('thu')->nullable(),
                'gio_batdau' => fn (Blueprint $table) => $table->time('gio_batdau')->nullable(),
                'gio_ketthuc' => fn (Blueprint $table) => $table->time('gio_ketthuc')->nullable(),
                'trang_thai' => fn (Blueprint $table) => $table->enum('trang_thai', ['ranh', 'ban'])->nullable(),
            ] as $column => $definition) {
                if (! Schema::hasColumn('lichranh_lichsu', $column)) {
                    Schema::table('lichranh_lichsu', $definition);
                }
            }

            if (Schema::hasColumn('lichranh_lichsu', 'thu_cu')) {
                DB::statement('UPDATE `lichranh_lichsu` SET `thu` = `thu_cu` WHERE `thu` IS NULL');
            }
            if (Schema::hasColumn('lichranh_lichsu', 'gio_batdau_cu')) {
                DB::statement('UPDATE `lichranh_lichsu` SET `gio_batdau` = `gio_batdau_cu` WHERE `gio_batdau` IS NULL');
            }
            if (Schema::hasColumn('lichranh_lichsu', 'gio_ketthuc_cu')) {
                DB::statement('UPDATE `lichranh_lichsu` SET `gio_ketthuc` = `gio_ketthuc_cu` WHERE `gio_ketthuc` IS NULL');
            }
            if (Schema::hasColumn('lichranh_lichsu', 'trang_thai_cu')) {
                DB::statement('UPDATE `lichranh_lichsu` SET `trang_thai` = `trang_thai_cu` WHERE `trang_thai` IS NULL');
            }

            Schema::table('lichranh_lichsu', function (Blueprint $table) {
                $columns = [
                    'giasu_id', 'hanh_dong', 'du_lieu_cu', 'du_lieu_moi', 'nguoi_thay_doi_id',
                    'loai_su_kien', 'thu_cu', 'gio_batdau_cu', 'gio_ketthuc_cu', 'trang_thai_cu',
                    'thu_moi', 'gio_batdau_moi', 'gio_ketthuc_moi', 'trang_thai_moi', 'ghi_chu',
                ];

                foreach ($columns as $column) {
                    if (Schema::hasColumn('lichranh_lichsu', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });

            $this->syncLichRanhLichSuTrangThaiEnum();
        }

        if (! Schema::hasTable('hocbu')) {
            Schema::create('hocbu', function (Blueprint $table) {
                $table->id();
                $table->foreignId('lichhoc_id')->constrained('lichhoc')->onDelete('cascade');
                $table->date('ngay_hoc_bu');
                $table->time('gio_batdau');
                $table->time('gio_ketthuc');
                $table->string('trang_thai', 50)->nullable();
                $table->text('ghi_chu')->nullable();
                $table->timestamp('created_at')->nullable();
            });
        }

        if (Schema::hasTable('thanhtoan')) {
            if (! Schema::hasColumn('thanhtoan', 'tien_goi') && ! Schema::hasColumn('thanhtoan', 'so_tien')) {
                Schema::table('thanhtoan', function (Blueprint $table) {
                    $table->decimal('tien_goi', 10, 2)->default(0)->after('goihoc_id');
                });
            }

            if (Schema::hasColumn('thanhtoan', 'so_tien') && ! Schema::hasColumn('thanhtoan', 'tien_goi')) {
                DB::statement('ALTER TABLE `thanhtoan` CHANGE `so_tien` `tien_goi` DECIMAL(10, 2) NOT NULL');
            }

            if (! Schema::hasColumn('thanhtoan', 'tien_hoan')) {
                Schema::table('thanhtoan', function (Blueprint $table) {
                    $table->decimal('tien_hoan', 10, 2)->default(0)->after('tien_goi');
                });
            }

            if (! Schema::hasColumn('thanhtoan', 'tong_tien')) {
                Schema::table('thanhtoan', function (Blueprint $table) {
                    $table->decimal('tong_tien', 10, 2)->default(0)->after('tien_hoan');
                });
            }

            if (Schema::hasColumn('thanhtoan', 'so_tien') && Schema::hasColumn('thanhtoan', 'tien_goi')) {
                DB::statement('UPDATE `thanhtoan` SET `tien_goi` = `so_tien` WHERE `tien_goi` = 0');
                Schema::table('thanhtoan', function (Blueprint $table) {
                    $table->dropColumn('so_tien');
                });
            }

            DB::statement('UPDATE `thanhtoan` SET `tong_tien` = `tien_goi` - `tien_hoan` WHERE `tong_tien` = 0');
        }

        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
        // Schema adjustment is intentionally not auto-reversible.
    }
};

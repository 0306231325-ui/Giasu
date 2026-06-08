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

    private function dropIndexIfExists(string $table, string $indexName): void
    {
        $exists = collect(DB::select("SHOW INDEX FROM `{$table}`"))
            ->pluck('Key_name')
            ->contains($indexName);

        if ($exists) {
            DB::statement("ALTER TABLE `{$table}` DROP INDEX `{$indexName}`");
        }
    }

    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        if (! Schema::hasTable('mon_lop')) {
            Schema::create('mon_lop', function (Blueprint $table) {
                $table->id();
                $table->foreignId('monhoc_id')->constrained('monhoc')->onDelete('cascade');
                $table->foreignId('lop_id')->constrained('lop')->onDelete('cascade');
                $table->decimal('gia_goc', 10, 2)->default(0);
                $table->decimal('gia_min', 10, 2)->nullable();
                $table->decimal('gia_max', 10, 2)->nullable();
                $table->boolean('dang_mo')->default(true);
                $table->text('ghi_chu')->nullable();
                $table->timestamps();

                $table->unique(['monhoc_id', 'lop_id']);
            });
        }

        if (Schema::hasTable('bang_gia_goc') && DB::table('mon_lop')->count() === 0) {
            $bangGiaGocs = DB::table('bang_gia_goc')->get();
            $lops = DB::table('lop')
                ->join('cap_hoc', 'lop.cap_hoc_id', '=', 'cap_hoc.id')
                ->select('lop.id', 'lop.thu_tu_trong_cap', 'cap_hoc.thu_tu as thu_tu_cap')
                ->get();
            $now = now();

            foreach ($bangGiaGocs as $giaGoc) {
                foreach ($lops as $lop) {
                    $giaTheoLop = (float) $giaGoc->gia_goc
                        + max(0, ((int) $lop->thu_tu_cap) - 1) * 100000
                        + max(0, ((int) $lop->thu_tu_trong_cap) - 1) * 50000;

                    DB::table('mon_lop')->updateOrInsert(
                        [
                            'monhoc_id' => $giaGoc->monhoc_id,
                            'lop_id' => $lop->id,
                        ],
                        [
                            'monhoc_id' => $giaGoc->monhoc_id,
                            'lop_id' => $lop->id,
                            'gia_goc' => $giaTheoLop,
                            'gia_min' => $giaGoc->gia_min !== null ? $giaTheoLop * 0.9 : null,
                            'gia_max' => $giaGoc->gia_max !== null ? $giaTheoLop * 1.1 : null,
                            'dang_mo' => true,
                            'ghi_chu' => $giaGoc->ghi_chu,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]
                    );
                }
            }
        }

        if (! Schema::hasTable('trinh_do_giasu')) {
            Schema::create('trinh_do_giasu', function (Blueprint $table) {
                $table->id();
                $table->string('ma', 80)->unique();
                $table->string('ten', 150);
                $table->decimal('gia_cong_them', 10, 2)->default(0);
                $table->unsignedSmallInteger('thu_tu')->default(0);
                $table->timestamps();
            });
        }

        if (! Schema::hasColumn('giasu', 'trinh_do_giasu_id')) {
            Schema::table('giasu', function (Blueprint $table) {
                $table->foreignId('trinh_do_giasu_id')
                    ->nullable()
                    ->after('hoc_van')
                    ->constrained('trinh_do_giasu')
                    ->nullOnDelete();
            });
        }

        if (! Schema::hasTable('giasu_cap_hoc')) {
            Schema::create('giasu_cap_hoc', function (Blueprint $table) {
                $table->id();
                $table->foreignId('giasu_id')->constrained('giasu')->onDelete('cascade');
                $table->foreignId('cap_hoc_id')->constrained('cap_hoc')->onDelete('cascade');
                $table->timestamps();

                $table->unique(['giasu_id', 'cap_hoc_id']);
            });
        }

        if (Schema::hasTable('giasu_mon_lop')) {
            if (! Schema::hasColumn('giasu_mon_lop', 'mon_lop_id')) {
                Schema::table('giasu_mon_lop', function (Blueprint $table) {
                    $table->foreignId('mon_lop_id')
                        ->nullable()
                        ->after('giasu_id')
                        ->constrained('mon_lop')
                        ->cascadeOnDelete();
                });
            }

            DB::table('giasu_mon_lop')
                ->join('mon_lop', function ($join) {
                    $join->on('giasu_mon_lop.monhoc_id', '=', 'mon_lop.monhoc_id')
                        ->on('giasu_mon_lop.lop_id', '=', 'mon_lop.lop_id');
                })
                ->update(['giasu_mon_lop.mon_lop_id' => DB::raw('mon_lop.id')]);

            $this->dropIndexIfExists('giasu_mon_lop', 'giasu_mon_lop_giasu_id_monhoc_id_lop_id_unique');
            $this->dropForeignIfExists('giasu_mon_lop', 'monhoc_id');
            $this->dropForeignIfExists('giasu_mon_lop', 'lop_id');

            if (Schema::hasColumn('giasu_mon_lop', 'monhoc_id') || Schema::hasColumn('giasu_mon_lop', 'lop_id')) {
                Schema::table('giasu_mon_lop', function (Blueprint $table) {
                    if (Schema::hasColumn('giasu_mon_lop', 'monhoc_id')) {
                        $table->dropColumn('monhoc_id');
                    }
                    if (Schema::hasColumn('giasu_mon_lop', 'lop_id')) {
                        $table->dropColumn('lop_id');
                    }
                });
            }

            DB::table('giasu_mon_lop')->whereNull('mon_lop_id')->delete();
            DB::statement('ALTER TABLE `giasu_mon_lop` MODIFY `mon_lop_id` BIGINT UNSIGNED NOT NULL');
            $this->dropIndexIfExists('giasu_mon_lop', 'giasu_mon_lop_giasu_id_mon_lop_id_unique');
            Schema::table('giasu_mon_lop', function (Blueprint $table) {
                $table->unique(['giasu_id', 'mon_lop_id']);
            });
        }

        if (Schema::hasTable('goihoc')) {
            if (! Schema::hasColumn('goihoc', 'mon_lop_id')) {
                Schema::table('goihoc', function (Blueprint $table) {
                    $table->foreignId('mon_lop_id')
                        ->nullable()
                        ->after('giasu_id')
                        ->constrained('mon_lop')
                        ->nullOnDelete();
                });
            }

            DB::table('goihoc')
                ->join('mon_lop', function ($join) {
                    $join->on('goihoc.monhoc_id', '=', 'mon_lop.monhoc_id')
                        ->on('goihoc.lop_id', '=', 'mon_lop.lop_id');
                })
                ->update(['goihoc.mon_lop_id' => DB::raw('mon_lop.id')]);

            if (! Schema::hasColumn('goihoc', 'dia_chi_hoc')) {
                Schema::table('goihoc', function (Blueprint $table) {
                    $table->string('dia_chi_hoc', 255)->nullable()->after('hoc_dinhky');
                    $table->enum('hinh_thuc_hoc', ['offline', 'online'])->default('offline')->after('dia_chi_hoc');
                });
            }

            if (Schema::hasColumn('goihoc', 'giasu_gia_id')) {
                $this->dropForeignIfExists('goihoc', 'giasu_gia_id');
                Schema::table('goihoc', function (Blueprint $table) {
                    $table->dropColumn('giasu_gia_id');
                });
            }
        }

        if (Schema::hasTable('lichhoc')) {
            if (! Schema::hasColumn('lichhoc', 'dia_chi_hoc')) {
                Schema::table('lichhoc', function (Blueprint $table) {
                    $table->string('dia_chi_hoc', 255)->nullable()->after('gio_ketthuc');
                    $table->enum('hinh_thuc_hoc', ['offline', 'online'])->default('offline')->after('dia_chi_hoc');
                });
            }
        }

        if (! Schema::hasTable('goihoc_lich_dinhky')) {
            Schema::create('goihoc_lich_dinhky', function (Blueprint $table) {
                $table->id();
                $table->foreignId('goihoc_id')->constrained('goihoc')->onDelete('cascade');
                $table->tinyInteger('thu');
                $table->time('gio_batdau');
                $table->time('gio_ketthuc');
                $table->timestamps();

                $table->unique(['goihoc_id', 'thu', 'gio_batdau', 'gio_ketthuc']);
            });
        }

        if (! Schema::hasTable('lichhoc_lichsu')) {
            Schema::create('lichhoc_lichsu', function (Blueprint $table) {
                $table->id();
                $table->foreignId('lichhoc_id')->constrained('lichhoc')->onDelete('cascade');
                $table->foreignId('nguoi_thay_doi_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('trang_thai_cu', 50)->nullable();
                $table->string('trang_thai_moi', 50)->nullable();
                $table->timestamps();
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
        }

        if (Schema::hasTable('cau_hinh_gia')) {
            if (! Schema::hasColumn('cau_hinh_gia', 'trinh_do_giasu_id')) {
                Schema::table('cau_hinh_gia', function (Blueprint $table) {
                    $table->foreignId('trinh_do_giasu_id')->nullable()->after('ma')->constrained('trinh_do_giasu')->nullOnDelete();
                    $table->foreignId('cap_hoc_id')->nullable()->after('trinh_do_giasu_id')->constrained('cap_hoc')->nullOnDelete();
                    $table->foreignId('mon_lop_id')->nullable()->after('cap_hoc_id')->constrained('mon_lop')->nullOnDelete();
                });
            }
        }

        Schema::dropIfExists('yeu_cau_gia');
        Schema::dropIfExists('giasu_gia');
        Schema::dropIfExists('bang_gia_goc');

        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
        // Schema refactor is intentionally not auto-reversible because it drops
        // legacy price approval tables and migrates relationships to mon_lop.
    }
};

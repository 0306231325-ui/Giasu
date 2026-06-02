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
        Schema::disableForeignKeyConstraints();

        if (Schema::hasTable('goihoc')) {
            DB::table('goihoc')->update(['giasu_gia_id' => null]);
        }
        if (Schema::hasTable('giasu_gia')) {
            DB::table('giasu_gia')->delete();
        }
        if (Schema::hasTable('yeu_cau_gia')) {
            DB::table('yeu_cau_gia')->delete();
        }

        if (Schema::hasColumn('giasu_gia', 'cap_hoc_id')) {
            $this->dropForeignIfExists('giasu_gia', 'cap_hoc_id');

            $indexes = collect(DB::select('SHOW INDEX FROM giasu_gia'))
                ->pluck('Key_name')
                ->unique();

            if ($indexes->contains('giasu_gia_giasu_id_cap_hoc_id_unique')) {
                Schema::table('giasu_gia', function (Blueprint $table) {
                    $table->dropUnique(['giasu_id', 'cap_hoc_id']);
                });
            }

            Schema::table('giasu_gia', function (Blueprint $table) {
                $table->dropColumn('cap_hoc_id');
            });
        }

        if (! Schema::hasColumn('giasu_gia', 'monhoc_id')) {
            Schema::table('giasu_gia', function (Blueprint $table) {
                $table->foreignId('monhoc_id')->after('giasu_id')->constrained('monhoc')->onDelete('cascade');
                $table->foreignId('lop_id')->after('monhoc_id')->constrained('lop')->onDelete('cascade');
                $table->unique(['giasu_id', 'monhoc_id', 'lop_id']);
            });
        }

        if (Schema::hasColumn('yeu_cau_gia', 'cap_hoc_id')) {
            $this->dropForeignIfExists('yeu_cau_gia', 'cap_hoc_id');
            Schema::table('yeu_cau_gia', function (Blueprint $table) {
                $table->dropColumn('cap_hoc_id');
            });
        }

        if (! Schema::hasColumn('yeu_cau_gia', 'monhoc_id')) {
            Schema::table('yeu_cau_gia', function (Blueprint $table) {
                $table->foreignId('monhoc_id')->after('giasu_id')->constrained('monhoc')->onDelete('cascade');
                $table->foreignId('lop_id')->after('monhoc_id')->constrained('lop')->onDelete('cascade');
            });
        }

        if (Schema::hasColumn('goihoc', 'cap_hoc_id')) {
            $this->dropForeignIfExists('goihoc', 'cap_hoc_id');
            Schema::table('goihoc', function (Blueprint $table) {
                $table->dropColumn('cap_hoc_id');
            });
        }

        if (! Schema::hasColumn('goihoc', 'lop_id')) {
            Schema::table('goihoc', function (Blueprint $table) {
                $table->foreignId('lop_id')->nullable()->after('monhoc_id')->constrained('lop')->nullOnDelete();
            });
        }

        if (Schema::hasColumn('giasu', 'cap_hoc_id')) {
            $this->dropForeignIfExists('giasu', 'cap_hoc_id');
            Schema::table('giasu', function (Blueprint $table) {
                $table->dropColumn('cap_hoc_id');
            });
        }

        Schema::dropIfExists('giasu_monhoc');
        Schema::dropIfExists('bang_gia');

        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();

        Schema::create('bang_gia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cap_hoc_id')->constrained('cap_hoc')->onDelete('cascade');
            $table->decimal('gia_mac_dinh', 10, 2);
            $table->decimal('gia_min', 10, 2)->nullable();
            $table->decimal('gia_max', 10, 2)->nullable();
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
        });

        Schema::create('giasu_monhoc', function (Blueprint $table) {
            $table->id();
            $table->foreignId('giasu_id')->constrained('giasu')->onDelete('cascade');
            $table->foreignId('monhoc_id')->constrained('monhoc')->onDelete('cascade');
        });

        Schema::table('giasu', function (Blueprint $table) {
            $table->foreignId('cap_hoc_id')->nullable()->after('hoc_van')->constrained('cap_hoc')->nullOnDelete();
        });

        Schema::table('goihoc', function (Blueprint $table) {
            $table->dropForeign(['lop_id']);
            $table->dropColumn('lop_id');
            $table->foreignId('cap_hoc_id')->nullable()->after('monhoc_id')->constrained('cap_hoc')->nullOnDelete();
        });

        Schema::table('yeu_cau_gia', function (Blueprint $table) {
            $table->dropForeign(['monhoc_id']);
            $table->dropForeign(['lop_id']);
            $table->dropColumn(['monhoc_id', 'lop_id']);
            $table->foreignId('cap_hoc_id')->after('giasu_id')->constrained('cap_hoc')->onDelete('cascade');
        });

        Schema::table('giasu_gia', function (Blueprint $table) {
            $table->dropForeign(['monhoc_id']);
            $table->dropForeign(['lop_id']);
            $table->dropUnique(['giasu_id', 'monhoc_id', 'lop_id']);
            $table->dropColumn(['monhoc_id', 'lop_id']);
        });

        Schema::table('giasu_gia', function (Blueprint $table) {
            $table->foreignId('cap_hoc_id')->after('giasu_id')->constrained('cap_hoc')->onDelete('cascade');
            $table->unique(['giasu_id', 'cap_hoc_id']);
        });

        Schema::enableForeignKeyConstraints();
    }
};

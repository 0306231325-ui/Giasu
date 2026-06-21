<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lichhoc', function (Blueprint $table) {
            if (! Schema::hasColumn('lichhoc', 'giasu_id')) {
                $table->foreignId('giasu_id')
                    ->nullable()
                    ->after('goihoc_id')
                    ->constrained('giasu')
                    ->nullOnDelete();
            }
        });

        DB::table('lichhoc')
            ->join('goihoc', 'goihoc.id', '=', 'lichhoc.goihoc_id')
            ->whereNull('lichhoc.giasu_id')
            ->update([
                'lichhoc.giasu_id' => DB::raw('goihoc.giasu_id'),
            ]);

        Schema::table('lichhoc', function (Blueprint $table) {
            if (Schema::hasColumn('lichhoc', 'nguoi_huy_id')) {
                $table->dropConstrainedForeignId('nguoi_huy_id');
            }

            foreach (['da_giam', 'hinh_thuc_xu_ly', 'lydo_huy', 'thoigian_huy'] as $column) {
                if (Schema::hasColumn('lichhoc', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('lichhoc_lichsu', function (Blueprint $table) {
            if (! Schema::hasColumn('lichhoc_lichsu', 'loai_su_kien')) {
                $table->string('loai_su_kien', 50)
                    ->nullable()
                    ->after('nguoi_thay_doi_id');
            }

            if (! Schema::hasColumn('lichhoc_lichsu', 'ly_do')) {
                $table->text('ly_do')
                    ->nullable()
                    ->after('trang_thai_moi');
            }

            if (! Schema::hasColumn('lichhoc_lichsu', 'hinh_thuc_xu_ly')) {
                $table->enum('hinh_thuc_xu_ly', ['hoc_bu', 'khong_hoan'])
                    ->nullable()
                    ->after('ly_do');
            }

            if (! Schema::hasColumn('lichhoc_lichsu', 'ngay_tao')) {
                $table->date('ngay_tao')
                    ->nullable()
                    ->after('hinh_thuc_xu_ly');
            }

            if (Schema::hasColumn('lichhoc_lichsu', 'ngay_ap_dung')) {
                $table->dropColumn('ngay_ap_dung');
            }
        });

        Schema::create('yeucau_hocbu', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lichhoc_goc_id')->constrained('lichhoc')->cascadeOnDelete();
            $table->foreignId('giasu_id')->constrained('giasu')->cascadeOnDelete();
            $table->foreignId('nguoi_yeu_cau_id')->constrained('users')->cascadeOnDelete();
            $table->date('ngay_hoc');
            $table->time('gio_batdau');
            $table->time('gio_ketthuc');
            $table->text('ly_do');
            $table->enum('trang_thai', ['cho_duyet', 'da_duyet', 'tu_choi'])
                ->default('cho_duyet');
            $table->foreignId('nguoi_duyet_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('yeucau_hocbu');

        Schema::table('lichhoc_lichsu', function (Blueprint $table) {
            foreach (['loai_su_kien', 'ly_do', 'hinh_thuc_xu_ly'] as $column) {
                if (Schema::hasColumn('lichhoc_lichsu', $column)) {
                    $table->dropColumn($column);
                }
            }

            if (! Schema::hasColumn('lichhoc_lichsu', 'ngay_ap_dung')) {
                $table->date('ngay_ap_dung')->nullable()->after('ngay_tao');
            }
        });

        Schema::table('lichhoc', function (Blueprint $table) {
            if (! Schema::hasColumn('lichhoc', 'da_giam')) {
                $table->decimal('da_giam', 5, 2)->default(0)->after('tien_hoc');
            }

            if (! Schema::hasColumn('lichhoc', 'nguoi_huy_id')) {
                $table->foreignId('nguoi_huy_id')->nullable()->constrained('users')->nullOnDelete();
            }

            if (! Schema::hasColumn('lichhoc', 'lydo_huy')) {
                $table->text('lydo_huy')->nullable();
            }

            if (! Schema::hasColumn('lichhoc', 'thoigian_huy')) {
                $table->dateTime('thoigian_huy')->nullable();
            }

            if (! Schema::hasColumn('lichhoc', 'hinh_thuc_xu_ly')) {
                $table->enum('hinh_thuc_xu_ly', ['hoc_bu', 'khong_tinh_phi'])->nullable();
            }

            if (Schema::hasColumn('lichhoc', 'giasu_id')) {
                $table->dropConstrainedForeignId('giasu_id');
            }
        });
    }
};

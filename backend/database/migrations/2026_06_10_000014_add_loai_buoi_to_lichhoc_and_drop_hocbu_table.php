<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('lichhoc') && ! Schema::hasColumn('lichhoc', 'loai_buoi')) {
            Schema::table('lichhoc', function (Blueprint $table) {
                $table->enum('loai_buoi', ['hoc_thuong', 'hoc_bu'])
                    ->default('hoc_thuong')
                    ->after('goihoc_id');
            });
        }

        if (Schema::hasTable('hocbu') && Schema::hasTable('lichhoc')) {
            $hocBus = DB::table('hocbu')
                ->join('lichhoc', 'lichhoc.id', '=', 'hocbu.lichhoc_id')
                ->select(
                    'hocbu.*',
                    'lichhoc.goihoc_id',
                    'lichhoc.dia_chi_hoc',
                    'lichhoc.hinh_thuc_hoc',
                    'lichhoc.tien_hoc',
                    'lichhoc.da_giam',
                    'lichhoc.phi_hoahong',
                    'lichhoc.tien_giasu_nhan'
                )
                ->get();

            foreach ($hocBus as $hocBu) {
                DB::table('lichhoc')->insert([
                    'goihoc_id' => $hocBu->goihoc_id,
                    'loai_buoi' => 'hoc_bu',
                    'ngay_hoc' => $hocBu->ngay_hoc_bu,
                    'gio_batdau' => $hocBu->gio_batdau,
                    'gio_ketthuc' => $hocBu->gio_ketthuc,
                    'dia_chi_hoc' => $hocBu->dia_chi_hoc,
                    'hinh_thuc_hoc' => $hocBu->hinh_thuc_hoc,
                    'tien_hoc' => $hocBu->tien_hoc ?? 0,
                    'da_giam' => $hocBu->da_giam ?? 0,
                    'phi_hoahong' => $hocBu->phi_hoahong ?? 0,
                    'tien_giasu_nhan' => $hocBu->tien_giasu_nhan ?? 0,
                    'trang_thai' => $hocBu->trang_thai ?: 'da_nhan',
                    'ghi_chu' => $hocBu->ghi_chu,
                    'created_at' => $hocBu->created_at ?? now(),
                    'updated_at' => now(),
                ]);
            }
        }

        Schema::dropIfExists('hocbu');
    }

    public function down(): void
    {
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

        if (Schema::hasTable('lichhoc') && Schema::hasColumn('lichhoc', 'loai_buoi')) {
            DB::table('lichhoc')->where('loai_buoi', 'hoc_bu')->delete();

            Schema::table('lichhoc', function (Blueprint $table) {
                $table->dropColumn('loai_buoi');
            });
        }
    }
};

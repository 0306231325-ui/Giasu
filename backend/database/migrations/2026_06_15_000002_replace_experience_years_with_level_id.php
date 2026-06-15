<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('giasu', function (Blueprint $table) {
            $table->foreignId('muc_kinh_nghiem_id')
                ->nullable()
                ->after('kinh_nghiem')
                ->constrained('muc_kinh_nghiem')
                ->nullOnDelete();
        });

        $giaSus = DB::table('giasu')
            ->select('id', 'so_nam_kinh_nghiem')
            ->get();

        foreach ($giaSus as $giaSu) {
            $mucKinhNghiemId = DB::table('muc_kinh_nghiem')
                ->where('tu_khoang', '<=', $giaSu->so_nam_kinh_nghiem)
                ->where(function ($query) use ($giaSu) {
                    $query->whereNull('den_khoang')
                        ->orWhere('den_khoang', '>=', $giaSu->so_nam_kinh_nghiem);
                })
                ->orderByDesc('tu_khoang')
                ->value('id');

            DB::table('giasu')->where('id', $giaSu->id)->update([
                'muc_kinh_nghiem_id' => $mucKinhNghiemId,
            ]);
        }

        Schema::table('giasu', function (Blueprint $table) {
            $table->dropColumn('so_nam_kinh_nghiem');
        });
    }

    public function down(): void
    {
        Schema::table('giasu', function (Blueprint $table) {
            $table->unsignedTinyInteger('so_nam_kinh_nghiem')
                ->default(0)
                ->after('kinh_nghiem');
        });

        DB::table('giasu')
            ->join('muc_kinh_nghiem', 'muc_kinh_nghiem.id', '=', 'giasu.muc_kinh_nghiem_id')
            ->update([
                'giasu.so_nam_kinh_nghiem' => DB::raw('muc_kinh_nghiem.tu_khoang'),
            ]);

        Schema::table('giasu', function (Blueprint $table) {
            $table->dropConstrainedForeignId('muc_kinh_nghiem_id');
        });
    }
};

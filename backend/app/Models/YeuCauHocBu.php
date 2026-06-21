<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class YeuCauHocBu extends Model
{
    use HasFactory;

    protected $table = 'yeucau_hocbu';

    protected $fillable = [
        'lichhoc_goc_id',
        'giasu_id',
        'nguoi_yeu_cau_id',
        'ngay_hoc',
        'gio_batdau',
        'gio_ketthuc',
        'ly_do',
        'trang_thai',
        'nguoi_duyet_id',
    ];

    protected $casts = [
        'ngay_hoc' => 'date',
    ];

    public function lichHocGoc(): BelongsTo
    {
        return $this->belongsTo(LichHoc::class, 'lichhoc_goc_id');
    }

    public function giasu(): BelongsTo
    {
        return $this->belongsTo(Giasu::class, 'giasu_id');
    }

    public function nguoiYeuCau(): BelongsTo
    {
        return $this->belongsTo(User::class, 'nguoi_yeu_cau_id');
    }

    public function nguoiDuyet(): BelongsTo
    {
        return $this->belongsTo(User::class, 'nguoi_duyet_id');
    }
}

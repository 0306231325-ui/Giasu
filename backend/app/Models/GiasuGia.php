<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GiasuGia extends Model
{
    protected $table = 'giasu_gia';

    protected $fillable = [
        'giasu_id',
        'monhoc_id',
        'trinh_do_giasu_id',
        'gia_mon',
        'gia_cong_them',
        'tong_gia',
    ];

    public function giasu(): BelongsTo
    {
        return $this->belongsTo(Giasu::class, 'giasu_id');
    }

    public function monHoc(): BelongsTo
    {
        return $this->belongsTo(MonHoc::class, 'monhoc_id');
    }

    public function trinhDo(): BelongsTo
    {
        return $this->belongsTo(TrinhDoGiasu::class, 'trinh_do_giasu_id');
    }
}

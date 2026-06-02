<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class YeuCauGia extends Model
{
    protected $table = 'yeu_cau_gia';

    protected $fillable = [
        'giasu_id',
        'monhoc_id',
        'lop_id',
        'trang_thai',
        'gia_duyet',
        'duyet_boi',
        'duyet_luc',
        'ly_do',
    ];

    public function giasu(): BelongsTo
    {
        return $this->belongsTo(Giasu::class, 'giasu_id');
    }

    public function monHoc(): BelongsTo
    {
        return $this->belongsTo(MonHoc::class, 'monhoc_id');
    }

    public function lop(): BelongsTo
    {
        return $this->belongsTo(Lop::class, 'lop_id');
    }
}

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
        'lop_id',
        'gia_theogio',
        'yeu_cau_gia_id',
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

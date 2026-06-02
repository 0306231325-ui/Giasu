<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BangGiaGoc extends Model
{
    protected $table = 'bang_gia_goc';

    protected $fillable = [
        'monhoc_id',
        'cap_hoc_id',
        'gia_goc',
        'gia_min',
        'gia_max',
        'ghi_chu',
    ];

    public function monHoc(): BelongsTo
    {
        return $this->belongsTo(MonHoc::class, 'monhoc_id');
    }

    public function capHoc(): BelongsTo
    {
        return $this->belongsTo(CapHoc::class, 'cap_hoc_id');
    }
}

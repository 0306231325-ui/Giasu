<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GiasuMonLop extends Model
{
    protected $table = 'giasu_mon_lop';

    protected $fillable = [
        'giasu_id',
        'monhoc_id',
        'lop_id',
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

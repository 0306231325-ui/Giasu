<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HocBu extends Model
{
    protected $table = 'hocbu';

    const UPDATED_AT = null;

    protected $fillable = [
        'lichhoc_id',
        'ngay_hoc_bu',
        'gio_batdau',
        'gio_ketthuc',
        'trang_thai',
        'ghi_chu',
    ];

    public function lichHoc(): BelongsTo
    {
        return $this->belongsTo(LichHoc::class, 'lichhoc_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LichHocLichSu extends Model
{
    protected $table = 'lichhoc_lichsu';

    protected $fillable = [
        'lichhoc_id',
        'nguoi_thay_doi_id',
        'trang_thai_cu',
        'trang_thai_moi',
    ];

    public function lichHoc(): BelongsTo
    {
        return $this->belongsTo(LichHoc::class, 'lichhoc_id');
    }
}

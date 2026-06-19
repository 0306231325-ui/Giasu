<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GiasuBangCap extends Model
{
    protected $table = 'giasu_bang_cap';

    protected $fillable = [
        'giasu_id',
        'ten_bang',
        'loai_bang',
        'chuyen_nganh',
        'truong_don_vi',
        'file_url',
        'trang_thai',
        'duyet_boi',
        'duyet_luc',
        'ly_do',
    ];

    public function giasu(): BelongsTo
    {
        return $this->belongsTo(Giasu::class, 'giasu_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GoiHocLichDinhKy extends Model
{
    protected $table = 'goihoc_lich_dinhky';

    protected $fillable = [
        'goihoc_id',
        'thu',
        'gio_batdau',
        'gio_ketthuc',
    ];

    public function goiHoc(): BelongsTo
    {
        return $this->belongsTo(GoiHoc::class, 'goihoc_id');
    }

    public function lichHocs(): HasMany
    {
        return $this->hasMany(LichHoc::class, 'goihoc_lich_dinhky_id');
    }
}

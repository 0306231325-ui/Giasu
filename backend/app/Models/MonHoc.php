<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MonHoc extends Model
{
    use HasFactory;

    protected $table = 'monhoc';

    protected $fillable = [
        'ten_mon',
        'mo_ta',
        'cap_hoc_id',
        'so_lop',
        'thu_tu_trong_cap',
        'gia',
    ];

    public function capHoc(): BelongsTo
    {
        return $this->belongsTo(CapHoc::class, 'cap_hoc_id');
    }

    public function giasuGias(): HasMany
    {
        return $this->hasMany(GiasuGia::class, 'monhoc_id');
    }
}

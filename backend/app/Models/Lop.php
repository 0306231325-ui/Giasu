<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Lop extends Model
{
    protected $table = 'lop';

    protected $fillable = [
        'ten',
        'so_lop',
        'cap_hoc_id',
        'thu_tu_trong_cap',
    ];

    public function capHoc(): BelongsTo
    {
        return $this->belongsTo(CapHoc::class, 'cap_hoc_id');
    }

    public function giasus(): BelongsToMany
    {
        return $this->belongsToMany(Giasu::class, 'giasu_mon_lop', 'lop_id', 'giasu_id')
            ->withPivot('monhoc_id')
            ->withTimestamps();
    }
}

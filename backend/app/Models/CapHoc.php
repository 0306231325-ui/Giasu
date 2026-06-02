<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CapHoc extends Model
{
    protected $table = 'cap_hoc';

    protected $fillable = [
        'ma',
        'ten',
        'thu_tu',
    ];

    public function lops(): HasMany
    {
        return $this->hasMany(Lop::class, 'cap_hoc_id');
    }

    public function bangGiaGocs(): HasMany
    {
        return $this->hasMany(BangGiaGoc::class, 'cap_hoc_id');
    }
}

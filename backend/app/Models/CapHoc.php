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

    public function monHocs(): HasMany
    {
        return $this->hasMany(MonHoc::class, 'cap_hoc_id');
    }
}

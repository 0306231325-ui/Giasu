<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TrinhDoGiasu extends Model
{
    protected $table = 'trinh_do_giasu';

    protected $fillable = [
        'ma',
        'ten',
        'gia_cong_them',
        'thu_tu',
    ];

    public function giasus(): HasMany
    {
        return $this->hasMany(Giasu::class, 'trinh_do_giasu_id');
    }
}

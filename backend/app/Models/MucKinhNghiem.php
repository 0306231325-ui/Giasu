<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MucKinhNghiem extends Model
{
    protected $table = 'muc_kinh_nghiem';

    protected $fillable = [
        'tu_khoang',
        'den_khoang',
        'gia_cong_them',
    ];

    protected $casts = [
        'tu_khoang' => 'integer',
        'den_khoang' => 'integer',
        'gia_cong_them' => 'decimal:2',
    ];

    public function giasus(): HasMany
    {
        return $this->hasMany(Giasu::class, 'muc_kinh_nghiem_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoaiGoi extends Model
{
    protected $table = 'loai_goi';

    protected $fillable = [
        'ten_loai_goi',
        'so_thang',
        'phan_tram_giam',
        'mo_ta',
    ];

    public function goiHocs()
    {
        return $this->hasMany(GoiHoc::class, 'loai_goi_id');
    }
}

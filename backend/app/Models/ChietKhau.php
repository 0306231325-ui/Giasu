<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChietKhau extends Model
{
    protected $table = 'chietkhau';

    protected $fillable = [
        'so_buoi',
        'phan_tram_giam',
        'mo_ta',
    ];

    public function goiHocs()
    {
        return $this->hasMany(GoiHoc::class, 'chietkhau_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CauHinhGia extends Model
{
    protected $table = 'cau_hinh_gia';

    protected $fillable = [
        'ma',
        'gia_tri',
        'mo_ta',
    ];
}

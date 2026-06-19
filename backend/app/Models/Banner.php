<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    protected $table = 'banner';

    protected $fillable = [
        'tieu_de',
        'mo_ta',
        'anh',
        'link',
        'trang_thai'
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BaiViet extends Model
{
    use SoftDeletes;

    protected $table = 'baiviet';

    protected $fillable = [
        'user_id',
        'tieu_de',
        'slug',
        'tom_tat',
        'noi_dung',
        'anh_bia',
        'luot_xem',
        'trang_thai'
    ];
}

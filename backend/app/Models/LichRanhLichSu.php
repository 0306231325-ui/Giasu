<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LichRanhLichSu extends Model
{
    protected $table = 'lichranh_lichsu';

    protected $fillable = [
        'lichranh_id',
        'thu',
        'gio_batdau',
        'gio_ketthuc',
        'trang_thai',
    ];
}

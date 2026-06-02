<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MonHoc extends Model
{
    use HasFactory;

    protected $table = 'monhoc';

    protected $fillable = [
        'ten_mon',
        'mo_ta',
    ];

    public function giasuMonLops()
    {
        return $this->hasMany(GiasuMonLop::class, 'monhoc_id');
    }

    public function bangGiaGocs()
    {
        return $this->hasMany(BangGiaGoc::class, 'monhoc_id');
    }
}
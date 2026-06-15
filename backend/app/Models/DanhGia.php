<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DanhGia extends Model
{
    use HasFactory;

    protected $table = 'danhgia';

    protected $fillable = [
        'lichhoc_id',
        'user_id',
        'so_sao',
        'noi_dung',
    ];

    public function lichHoc()
    {
        return $this->belongsTo(LichHoc::class, 'lichhoc_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

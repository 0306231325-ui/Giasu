<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HocVien extends Model
{
    use HasFactory;

    protected $table = 'hocvien';

    protected $fillable = [
        'user_id',
        'lop',
        'truong_hoc',
        'dia_chi',
        'avatar',
        'ten_phu_huynh',
        'sdt_phu_huynh',
        'muc_tieu_hoc_tap',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

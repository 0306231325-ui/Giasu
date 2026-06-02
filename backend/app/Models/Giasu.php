<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Giasu extends Model
{
    use HasFactory;

    protected $table = 'giasu';

    protected $fillable = [
        'user_id',
        'mo_ta',
        'kinh_nghiem',
        'hoc_van',
        'dia_chi',
        'avatar',
        'trang_thai_ho_so',
        'duyet_boi',
        'duyet_luc',
        'ly_do_tu_choi',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function goiHocs()
    {
        return $this->hasMany(GoiHoc::class, 'giasu_id');
    }

    public function lichHocs()
    {
        return $this->hasManyThrough(
            LichHoc::class,
            GoiHoc::class,
            'giasu_id',
            'goihoc_id',
            'id',
            'id'
        );
    }

    public function monLops()
    {
        return $this->hasMany(GiasuMonLop::class, 'giasu_id');
    }

    public function giaTheoMonLop()
    {
        return $this->hasMany(GiasuGia::class, 'giasu_id');
    }

    public function bangCaps()
    {
        return $this->hasMany(GiasuBangCap::class, 'giasu_id');
    }
}

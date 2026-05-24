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
        'gia_theogio',
        'dia_chi',
        'avatar',
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
}

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
        'trinh_do_giasu_id',
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

    public function giasuGias()
    {
        return $this->hasMany(GiasuGia::class, 'giasu_id');
    }

    public function monHocs()
    {
        return $this->belongsToMany(MonHoc::class, 'giasu_gia', 'giasu_id', 'monhoc_id')
            ->withPivot('trinh_do_giasu_id', 'gia_mon', 'gia_cong_them', 'tong_gia')
            ->withTimestamps();
    }

    public function trinhDo()
    {
        return $this->belongsTo(TrinhDoGiasu::class, 'trinh_do_giasu_id');
    }

    public function capHocs()
    {
        return $this->belongsToMany(CapHoc::class, 'giasu_cap_hoc', 'giasu_id', 'cap_hoc_id')
            ->withTimestamps();
    }

    public function bangCaps()
    {
        return $this->hasMany(GiasuBangCap::class, 'giasu_id');
    }
}

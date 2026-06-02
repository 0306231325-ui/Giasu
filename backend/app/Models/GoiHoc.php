<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GoiHoc extends Model
{
    use HasFactory;

    protected $table = 'goihoc';

    protected $fillable = [
        'hocvien_id',
        'giasu_id',
        'monhoc_id',
        'lop_id',
        'ngay_batdau',
        'ngay_ketthuc',
        'so_buoi',
        'hoc_dinhky',
        'tong_tien',
        'don_gia_theogio',
        'giasu_gia_id',
        'trang_thai',
    ];

    public function lop()
    {
        return $this->belongsTo(Lop::class, 'lop_id');
    }

    public function monHoc()
    {
        return $this->belongsTo(MonHoc::class, 'monhoc_id');
    }

    public function giasu()
    {
        return $this->belongsTo(Giasu::class, 'giasu_id');
    }

    public function lichHocs()
    {
        return $this->hasMany(LichHoc::class, 'goihoc_id');
    }
}

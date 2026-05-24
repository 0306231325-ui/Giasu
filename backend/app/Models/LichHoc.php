<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LichHoc extends Model
{
    use HasFactory;

    protected $table = 'lichhoc';

    protected $fillable = [
        'goihoc_id',
        'ngay_hoc',
        'gio_batdau',
        'gio_ketthuc',
        'phi_hoahong',
        'tien_giasu_nhan',
        'trang_thai',
        'ghi_chu',
        'nguoi_huy_id',
        'lydo_huy',
        'thoigian_huy',
    ];

    public function goiHoc()
    {
        return $this->belongsTo(GoiHoc::class, 'goihoc_id');
    }

    public function danhGia()
    {
        return $this->hasOne(DanhGia::class, 'lichhoc_id');
    }
}

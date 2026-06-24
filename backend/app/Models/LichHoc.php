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
        'giasu_id',
        'loai_buoi',
        'ngay_hoc',
        'gio_batdau',
        'gio_ketthuc',
        'dia_chi_hoc',
        'hinh_thuc_hoc',
        'tien_hoc',
        'phi_hoahong',
        'tien_giasu_nhan',
        'trang_thai',
        'lydo_huy',
        'nguoi_huy_id',
        'thoigian_huy',
        'ghi_chu',
    ];

    public function goiHoc()
    {
        return $this->belongsTo(GoiHoc::class, 'goihoc_id');
    }

    public function giasu()
    {
        return $this->belongsTo(Giasu::class, 'giasu_id');
    }

    public function danhGia()
    {
        return $this->hasOne(DanhGia::class, 'lichhoc_id');
    }

    public function yeuCauHocBus()
    {
        return $this->hasMany(YeuCauHocBu::class, 'lichhoc_goc_id');
    }
}

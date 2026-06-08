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
        'goihoc_lich_dinhky_id',
        'ngay_hoc',
        'gio_batdau',
        'gio_ketthuc',
        'dia_chi_hoc',
        'hinh_thuc_hoc',
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

    public function lichDinhKy()
    {
        return $this->belongsTo(GoiHocLichDinhKy::class, 'goihoc_lich_dinhky_id');
    }

    public function danhGia()
    {
        return $this->hasOne(DanhGia::class, 'lichhoc_id');
    }

    public function lichSus()
    {
        return $this->hasMany(LichHocLichSu::class, 'lichhoc_id');
    }

    public function hocBus()
    {
        return $this->hasMany(HocBu::class, 'lichhoc_id');
    }
}

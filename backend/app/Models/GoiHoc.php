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
        'giasu_gia_id',
        'loai_goi_id',
        'ngay_batdau',
        'ngay_ketthuc',
        'so_buoi',
        'hoc_dinhky',
        'thu',
        'gio_batdau',
        'gio_ketthuc',
        'dia_chi_hoc',
        'hinh_thuc_hoc',
        'tong_tien',
        'don_gia_theogio',
        'trang_thai',
        'gui_giasu_luc',
        'admin_xu_ly_id',
        'ly_do_huy',
    ];

    protected $casts = [
        'hoc_dinhky' => 'boolean',
        'gui_giasu_luc' => 'datetime',
    ];

    public function hocVien()
    {
        return $this->belongsTo(User::class, 'hocvien_id');
    }

    public function monHoc()
    {
        return $this->belongsTo(MonHoc::class, 'monhoc_id');
    }

    public function giasu()
    {
        return $this->belongsTo(Giasu::class, 'giasu_id');
    }

    public function giasuGia()
    {
        return $this->belongsTo(GiasuGia::class, 'giasu_gia_id');
    }

    public function loaiGoi()
    {
        return $this->belongsTo(LoaiGoi::class, 'loai_goi_id');
    }

    public function lichHocs()
    {
        return $this->hasMany(LichHoc::class, 'goihoc_id');
    }

    public function phanHois()
    {
        return $this->hasMany(PhanHoi::class, 'goi_hoc_id');
    }
}

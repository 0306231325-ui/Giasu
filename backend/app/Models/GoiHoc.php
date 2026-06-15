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
        'chietkhau_id',
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
    ];

    protected $casts = [
        'hoc_dinhky' => 'boolean',
    ];

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

    public function chietKhau()
    {
        return $this->belongsTo(ChietKhau::class, 'chietkhau_id');
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

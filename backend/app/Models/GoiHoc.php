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
        'ngay_batdau',
        'ngay_ketthuc',
        'so_buoi',
        'hoc_dinhky',
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

    public function lichHocs()
    {
        return $this->hasMany(LichHoc::class, 'goihoc_id');
    }

    public function lichDinhKys()
    {
        return $this->hasMany(GoiHocLichDinhKy::class, 'goihoc_id');
    }
}

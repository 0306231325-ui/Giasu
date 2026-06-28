<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ThanhToan extends Model
{
    use HasFactory;

    protected $table = 'thanhtoan';

    protected $fillable = [
        'goihoc_id',
        'so_tien',
        'phuong_thuc',
        'so_tai_khoan',
        'ma_giaodich',
        'noi_dung_thanhtoan',
        'anh_minh_chung',
        'ngay_thanhtoan',
        'trang_thai',
    ];

    protected $casts = [
        'ngay_thanhtoan' => 'datetime',
    ];

    public function goiHoc()
    {
        return $this->belongsTo(GoiHoc::class, 'goihoc_id');
    }
}

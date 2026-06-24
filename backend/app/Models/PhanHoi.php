<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhanHoi extends Model
{
    use HasFactory;

    public const DONG_Y = 'dong_y';
    public const TU_CHOI = 'tu_choi';

    protected $table = 'phan_hoi';

    protected $fillable = [
        'gia_su_id',
        'goi_hoc_id',
        'phan_hoi',
        'ly_do',
    ];

    public function giaSu()
    {
        return $this->belongsTo(Giasu::class, 'gia_su_id');
    }

    public function goiHoc()
    {
        return $this->belongsTo(GoiHoc::class, 'goi_hoc_id');
    }
}

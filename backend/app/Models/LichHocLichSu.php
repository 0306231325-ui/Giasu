<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LichHocLichSu extends Model
{
    protected $table = 'lichhoc_lichsu';

    protected $fillable = [
        'lichhoc_id',
        'nguoi_thay_doi_id',
        'loai_su_kien',
        'trang_thai_cu',
        'trang_thai_moi',
        'ly_do',
        'hinh_thuc_xu_ly',
        'ngay_tao',
    ];

    public function lichHoc(): BelongsTo
    {
        return $this->belongsTo(LichHoc::class, 'lichhoc_id');
    }

    public function nguoiThayDoi(): BelongsTo
    {
        return $this->belongsTo(User::class, 'nguoi_thay_doi_id');
    }
}

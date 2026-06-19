<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GiasuGia extends Model
{
    public const TRANG_THAI_CHO_DUYET = 'cho_duyet';

    public const TRANG_THAI_DA_DUYET = 'da_duyet';

    public const TRANG_THAI_TU_CHOI = 'tu_choi';

    public const TRANG_THAI_NGUNG_DAY = 'ngung_day';

    protected $table = 'giasu_gia';

    protected $fillable = [
        'giasu_id',
        'monhoc_id',
        'gia_mon',
        'gia_cong_trinh_do',
        'gia_cong_kinh_nghiem',
        'gia_cong_them',
        'tong_gia',
        'trang_thai',
        'ly_do_tu_choi',
    ];

    protected $casts = [
        'gia_mon' => 'decimal:2',
        'gia_cong_trinh_do' => 'decimal:2',
        'gia_cong_kinh_nghiem' => 'decimal:2',
        'gia_cong_them' => 'decimal:2',
        'tong_gia' => 'decimal:2',
    ];

    public function giasu(): BelongsTo
    {
        return $this->belongsTo(Giasu::class, 'giasu_id');
    }

    public function monHoc(): BelongsTo
    {
        return $this->belongsTo(MonHoc::class, 'monhoc_id');
    }
}

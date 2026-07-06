<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NhatKyHeThong extends Model
{
    use HasFactory;

    protected $table = 'nhat_ky_he_thong';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'hanh_dong',
        'vai_tro',
        'doi_tuong_id',
        'noi_dung',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

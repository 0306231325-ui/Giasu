<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ThongBao extends Model
{
    use HasFactory;

    protected $table = 'thongbao';

    protected $fillable = [
        'user_id',
        'tieu_de',
        'noi_dung',
        'url',
        'da_doc',
    ];

    protected $casts = [
        'da_doc' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

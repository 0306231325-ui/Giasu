<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MonHoc extends Model
{
    use HasFactory;

    protected $table = 'monhoc';

    protected $fillable = [
        'ten_mon',
        'mo_ta',
    ];

    public function giasus()
    {
        return $this->belongsToMany(
            Giasu::class,
            'giasu_monhoc',
            'monhoc_id',
            'giasu_id'
        );
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GiasuMonHoc extends Model
{
    use HasFactory;

    protected $table = 'giasu_monhoc';

    protected $fillable = [
        'giasu_id',
        'monhoc_id',
    ];
}
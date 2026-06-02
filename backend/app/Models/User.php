<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;


    protected $fillable = [
        'ho_ten',
        'email',
        'password',
        'sdt',
        'vai_tro',
        'anh_dai_dien',
        'trang_thai',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];


    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
        ];
    }

    public function giasu()
    {
        return $this->hasOne(Giasu::class, 'user_id', 'id');
    }

    public function lichHocs()
{
    return $this->hasMany(LichHoc::class, 'user_id');
}
}
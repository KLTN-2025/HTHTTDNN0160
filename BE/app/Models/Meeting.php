<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Meeting extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'passcode',
        'owner_id',
        'time_start',
        'time_end',
        'is_waiting',
        'is_user_allowed_pass_waiting'
    ];

    protected $casts = [
        'is_waiting' => 'boolean',
        'is_user_allowed_pass_waiting' => 'boolean',
        'time_start' => 'datetime',
        'time_end' => 'datetime',
    ];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserXuxemon extends Model
{
    protected $table = 'user_xuxemons';
    
    protected $fillable = [
        'user_id', 'xuxemon_id', 'size', 'obtained_at'
    ];
    
    // Relación con el Xuxemon (catálogo)
    public function xuxemon()
    {
        return $this->belongsTo(Xuxemon::class, 'xuxemon_id');
    }
    
    // Relación con el usuario
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

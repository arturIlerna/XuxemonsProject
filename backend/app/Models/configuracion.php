<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Configuracion extends Model
{
    protected $table = 'configuraciones';  // ← Forzar el nombre correcto de la tabla
    
    protected $fillable = ['clave', 'valor'];
    
    protected $casts = [
        'valor' => 'array'
    ];
}
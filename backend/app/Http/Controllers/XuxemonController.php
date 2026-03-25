<?php

namespace App\Http\Controllers;

use App\Models\Xuxemon; 
use App\Models\UserXuxemon; 
use Illuminate\Http\Request;

class XuxemonController extends Controller
{
    // 1. Obtener TODOS los Xuxemons (Catálogo global)
    public function index()
    {
        $xuxemons = Xuxemon::all();
        return response()->json($xuxemons, 200);
    }

    // 2. Obtener SOLO los Xuxemons del usuario logueado 
    public function myCollection()
    {
        $myCollection = UserXuxemon::join('xuxemons', 'user_xuxemons.xuxemon_id', '=', 'xuxemons.id')
            ->where('user_xuxemons.user_id', auth()->id())
            ->select('xuxemons.*', 'user_xuxemons.size as current_size') 
            ->get();
            
        return response()->json($myCollection, 200);
    }
}
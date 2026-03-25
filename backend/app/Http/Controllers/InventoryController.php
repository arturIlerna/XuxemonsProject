<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserItem;

class InventoryController extends Controller
{
    // Obtener la mochila del usuario logueado
    public function index()
    {
        $inventory = UserItem::where('user_id', auth()->id())->get();
        return response()->json($inventory, 200);
    }
}
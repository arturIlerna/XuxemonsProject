<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserItem;

class InventoryController extends Controller
{
    // LLISTAR: Ver la mochila 
    public function index()
    {
        // Consultem directament, ja que 'name', 'type' i 'quantity' són a la mateixa taula
        $inventory = UserItem::where('user_id', auth()->id())->orderBy('slot')->get();
        return response()->json($inventory, 200);
    }

    // MODIFICAR: Gastar una unidad de un objeto (Usar)
    public function useItem(Request $request, $id)
    {
        $item = UserItem::where('user_id', auth()->id())->where('id', $id)->first();

        if (!$item) {
            return response()->json(['message' => 'Objeto no encontrado'], 404);
        }

        // Si hi ha més d'un, restem a 'quantity'. Si només en queda un, eliminem l'slot.
        if ($item->quantity > 1) {
            $item->quantity -= 1;
            $item->save();
        } else {
            $item->delete();
        }

        return response()->json(['message' => 'Objeto usado correctamente'], 200);
    }

    // ELIMINAR: Tirar el stack completo a la basura
    public function destroy($id)
    {
        $item = UserItem::where('user_id', auth()->id())->where('id', $id)->first();

        if (!$item) {
            return response()->json(['message' => 'Objeto no encontrado'], 404);
        }

        $item->delete();
        return response()->json(['message' => 'Objeto eliminado de la mochila'], 200);
    }
}
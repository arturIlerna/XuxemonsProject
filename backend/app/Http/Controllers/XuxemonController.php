<?php

namespace App\Http\Controllers;

use App\Models\Xuxemon; 
use App\Models\UserXuxemon; 
use Illuminate\Http\Request;

class XuxemonController extends Controller
{
    // ==========================================
    // 🌍 1. LECTURA Y FILTROS (Para todos)
    // ==========================================
    public function index(Request $request)
    {
        // Iniciamos la query
        $query = Xuxemon::query();

        // Aplicamos los filtros por Query si el Frontend los envía (?type=Agua&size=Pequeño)
        if ($request->has('type') && $request->type !== 'todos') {
            $query->where('type', $request->type);
        }
        if ($request->has('size') && $request->size !== 'todas') {
            $query->where('size', $request->size);
        }

        // Ejecutamos la query y devolvemos los resultados
        $xuxemons = $query->get();
        return response()->json($xuxemons, 200);
    }

    public function myCollection()
    {
        $myCollection = UserXuxemon::join('xuxemons', 'user_xuxemons.xuxemon_id', '=', 'xuxemons.id')
            ->where('user_xuxemons.user_id', auth()->id())
            ->select('xuxemons.*', 'user_xuxemons.size as current_size') 
            ->get();
            
        return response()->json($myCollection, 200);
    }

    // 2. CRUD DEL ADMIN
    
    // CREAR un nuevo Xuxemon global
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:Agua,Tierra,Aire',
            'size' => 'required|string|in:Pequeño,Mediano,Grande',
            'image' => 'nullable|string'
        ]);

        $xuxemon = Xuxemon::create($validatedData);

        return response()->json(['message' => 'Xuxemon creado', 'xuxemon' => $xuxemon], 201);
    }

    // MODIFICAR un Xuxemon global
    public function update(Request $request, $id)
    {
        $xuxemon = Xuxemon::find($id);
        if (!$xuxemon) return response()->json(['message' => 'No encontrado'], 404);

        $xuxemon->update($request->all());
        
        return response()->json(['message' => 'Xuxemon actualizado', 'xuxemon' => $xuxemon], 200);
    }

    // ELIMINAR un Xuxemon global
    public function destroy($id)
    {
        $xuxemon = Xuxemon::find($id);
        if (!$xuxemon) return response()->json(['message' => 'No encontrado'], 404);

        $xuxemon->delete();
        return response()->json(['message' => 'Xuxemon eliminado correctamente'], 200);
    }
}
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Xuxemon;
use App\Models\UserXuxemon;

class XuxemonController extends Controller
{
    // Catálogo global de Xuxemons
    public function index(Request $request)
    {
        $query = Xuxemon::query();
        
        if ($request->has('type') && $request->type !== 'todos') {
            $query->where('type', $request->type);
        }
        
        if ($request->has('size') && $request->size !== 'todas') {
            $query->where('size', $request->size);
        }
        
        return response()->json($query->get());
    }
    
    // Mis Xuxemons (colección del usuario)
    public function myCollection()
    {
        $userXuxemons = UserXuxemon::where('user_id', auth()->id())
            ->with('xuxemon')
            ->get()
            ->map(function ($userXuxemon) {
                return [
                    'id' => $userXuxemon->id,
                    'name' => $userXuxemon->xuxemon->name,
                    'type' => $userXuxemon->xuxemon->type,
                    'size' => $userXuxemon->size,
                    'level' => $userXuxemon->xuxemon->level,
                    'attack' => $userXuxemon->xuxemon->attack,
                    'defense' => $userXuxemon->xuxemon->defense,
                ];
            });
        
        return response()->json($userXuxemons);
    }
    
    // Crear un nuevo Xuxemon en el catálogo
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'size' => 'required|string',
            'level' => 'required|integer',
        ]);
        
        $xuxemon = Xuxemon::create($request->all());
        
        return response()->json($xuxemon, 201);
    }
    
    // Actualizar un Xuxemon del catálogo
    public function update(Request $request, $id)
    {
        $xuxemon = Xuxemon::findOrFail($id);
        $xuxemon->update($request->all());
        
        return response()->json($xuxemon);
    }
    
    // Eliminar un Xuxemon del catálogo
    public function destroy($id)
    {
        $xuxemon = Xuxemon::findOrFail($id);
        $xuxemon->delete();
        
        return response()->json(['message' => 'Xuxemon eliminado']);
    }
    
    // ========== MÉTODO DE EVOLUCIÓN ==========
    public function evolve($id)
    {
        try {
            $userXuxemon = UserXuxemon::where('id', $id)
                ->where('user_id', auth()->id())
                ->firstOrFail();
            
            $nuevoTamaño = '';
            $mensaje = '';
            
            switch($userXuxemon->size) {
                case 'Pequeño':
                    $nuevoTamaño = 'Mediano';
                    $mensaje = '¡Tu Xuxemon ha evolucionado a tamaño Mediano!';
                    break;
                case 'Mediano':
                    $nuevoTamaño = 'Grande';
                    $mensaje = '¡Tu Xuxemon ha evolucionado a tamaño Grande!';
                    break;
                default:
                    return response()->json([
                        'success' => false,
                        'message' => 'Ya está en tamaño máximo'
                    ], 400);
            }
            
            $userXuxemon->size = $nuevoTamaño;
            $userXuxemon->save();
            
            return response()->json([
                'success' => true,
                'message' => $mensaje,
                'size' => $nuevoTamaño
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al evolucionar el Xuxemon'
            ], 500);
        }
    }
}
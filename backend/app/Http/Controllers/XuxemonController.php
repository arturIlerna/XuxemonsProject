<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Xuxemon;
use App\Models\UserXuxemon;
use App\Models\UserItem;
use App\Models\Configuracion;

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
        
        $xuxemons = $query->get();
        
        // Agregar la imagen según el tamaño de cada Xuxemon
        foreach ($xuxemons as $xuxemon) {
            $size = $xuxemon->size ?? 'Pequeño';
            $sizeNormalizado = str_replace('Pequeño', 'Pequeno', $size);
            $xuxemon->image = "images/xuxemons/{$xuxemon->name}_{$sizeNormalizado}.webp";
        }
        
        return response()->json($xuxemons);
    }
    
    // Mis Xuxemons (colección del usuario) - CON IMAGEN SEGÚN TAMAÑO
    public function myCollection()
    {
        $userXuxemons = UserXuxemon::where('user_id', auth()->id())
            ->with('xuxemon')
            ->get()
            ->map(function ($userXuxemon) {
                
                $nombreBase = $userXuxemon->xuxemon->name;
                $tamaño = $userXuxemon->size;
                $tamañoNormalizado = str_replace('Pequeño', 'Pequeno', $tamaño);
                $imagen = "images/xuxemons/{$nombreBase}_{$tamañoNormalizado}.webp";
                
                return [
                    'id' => $userXuxemon->id,
                    'name' => $userXuxemon->xuxemon->name,
                    'image' => $imagen,
                    'type' => $userXuxemon->xuxemon->type,
                    'size' => $userXuxemon->size,
                    'level' => $userXuxemon->xuxemon->level,
                    'attack' => $userXuxemon->xuxemon->attack,
                    'defense' => $userXuxemon->xuxemon->defense,
                    'enfermedad' => $userXuxemon->enfermedad, 
                    'xuxes_comidas' => $userXuxemon->xuxes_comidas 
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
    
    // ========== NIVEL 3: ALIMENTAR XUXEMON ==========
    public function feed(Request $request, $id)
    {
        $request->validate([
            'user_item_id' => 'required|integer', 
            'cantidad' => 'required|integer|min:1'
        ]);

        $userXuxemon = UserXuxemon::where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        if ($userXuxemon->enfermedad === 'Atracón' || $userXuxemon->enfermedad === 'Atracon') {
            return response()->json(['success' => false, 'message' => 'El teu Xuxemon té un Atracón i no pot menjar!'], 400);
        }

        $userItem = UserItem::where('id', $request->user_item_id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        if ($userItem->quantity < $request->cantidad) {
            return response()->json(['success' => false, 'message' => 'No tens suficients xuxes a la motxilla!'], 400);
        }

        $userItem->quantity -= $request->cantidad;
        if ($userItem->quantity <= 0) {
            $userItem->delete(); 
        } else {
            $userItem->save();
        }

        $probInfeccion = json_decode(Configuracion::where('clave', 'probabilidad_infeccion')->value('valor')) ?? 30;
        $reqMediano = json_decode(Configuracion::where('clave', 'xuxes_mediano')->value('valor')) ?? 3;
        $reqGrande = json_decode(Configuracion::where('clave', 'xuxes_grande')->value('valor')) ?? 5;

        for ($i = 0; $i < $request->cantidad; $i++) {
            $rand = rand(1, 100);
            
            if ($rand <= $probInfeccion) {
                if (rand(1, 2) === 1) {
                    $userXuxemon->enfermedad = 'Bajón de azúcar';
                } else {
                    $userXuxemon->enfermedad = 'Atracón';
                }
            }
        }
   
        $userXuxemon->xuxes_comidas += $request->cantidad;

        $xuxesNecessaries = 999; 
        if ($userXuxemon->size === 'Pequeño') {
            $xuxesNecessaries = (int)$reqMediano;
        } elseif ($userXuxemon->size === 'Mediano') {
            $xuxesNecessaries = (int)$reqGrande;
        }

        if ($userXuxemon->enfermedad === 'Bajón de azúcar') {
            $xuxesNecessaries += 2;
        }

        $missatge = 'Xuxemon alimentat correctament.';
        $evoluciono = false;

        if ($userXuxemon->size !== 'Grande' && $userXuxemon->xuxes_comidas >= $xuxesNecessaries) {
            $userXuxemon->size = ($userXuxemon->size === 'Pequeño') ? 'Mediano' : 'Grande';
            $userXuxemon->xuxes_comidas = 0; 
            $missatge = 'El teu Xuxemon ha evolucionat a mida ' . $userXuxemon->size . '!';
            $evoluciono = true;
        } elseif ($userXuxemon->size === 'Grande') {
            $missatge = 'El teu Xuxemon ja és de mida màxima, però ha disfrutat el menjar.';
        }

        $userXuxemon->save();

        $nombreBase = $userXuxemon->xuxemon->name;
        $tamañoNormalizado = str_replace('Pequeño', 'Pequeno', $userXuxemon->size);
        $nuevaImagen = "images/xuxemons/{$nombreBase}_{$tamañoNormalizado}.webp";

        return response()->json([
            'success' => true,
            'message' => $missatge,
            'evoluciono' => $evoluciono,
            'xuxemon' => [
                'id' => $userXuxemon->id,
                'name' => $userXuxemon->xuxemon->name,
                'image' => $nuevaImagen,
                'size' => $userXuxemon->size,
                'level' => $userXuxemon->xuxemon->level,
                'attack' => $userXuxemon->xuxemon->attack,
                'defense' => $userXuxemon->xuxemon->defense,
                'enfermedad' => $userXuxemon->enfermedad,
                'xuxes_comidas' => $userXuxemon->xuxes_comidas
            ]
        ]);
    }

    // ========== NIVEL 3: APLICAR VACUNAS ==========
    public function aplicarVacuna(Request $request, $id)
    {
        $request->validate([
            'user_item_id' => 'required|integer', 
        ]);

        $userXuxemon = UserXuxemon::where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        if (!$userXuxemon->enfermedad) {
            return response()->json(['success' => false, 'message' => 'Aquest Xuxemon ja està completament sa.'], 400);
        }

        $userItem = UserItem::where('id', $request->user_item_id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $nomVacuna = $userItem->item->name ?? $userItem->name;
        $curat = false;
        $missatge = '';

        if ($nomVacuna === 'Xocolatina' && $userXuxemon->enfermedad === 'Bajón de azúcar') {
            $curat = true;
            $missatge = 'Has curat el Bajón de azúcar amb una Xocolatina.';
        } elseif ($nomVacuna === 'Xal de fruites' && $userXuxemon->enfermedad === 'Atracón') {
            $curat = true;
            $missatge = 'Has curat l\'Atracón amb un Xal de fruites.';
        } elseif ($nomVacuna === 'Inxulina') {
            $curat = true;
            $missatge = 'L\'Inxulina ha curat completament el teu Xuxemon.';
        } else {
            return response()->json(['success' => false, 'message' => 'Aquesta vacuna no serveix per a la malaltia actual del Xuxemon.'], 400);
        }

        if ($curat) {
            $userXuxemon->enfermedad = null;
            $userXuxemon->save();

            $userItem->quantity -= 1;
            if ($userItem->quantity <= 0) {
                $userItem->delete();
            } else {
                $userItem->save();
            }

            return response()->json([
                'success' => true,
                'message' => $missatge,
                'xuxemon' => $userXuxemon
            ]);
        }
    }
}
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Xuxemon;
use App\Models\UserXuxemon;
use App\Models\UserItem;

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
    
    // ========== NIVELL 3: ALIMENTAR XUXEMON ==========
    public function feed(Request $request, $id)
    {
        $request->validate([
            'user_item_id' => 'required|integer', 
            'cantidad' => 'required|integer|min:1'
        ]);

        $userXuxemon = UserXuxemon::where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        // 1. Validació de la malaltia "Atracón"
        if ($userXuxemon->enfermedad === 'Atracón') {
            return response()->json(['success' => false, 'message' => 'El teu Xuxemon té un Atracón i no pot menjar!'], 400);
        }

        // 2. Descomptar Xuxes de la motxilla
        $userItem = UserItem::where('id', $request->user_item_id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        // Usem 'quantity' de la base de dades
        if ($userItem->quantity < $request->cantidad) {
            return response()->json(['success' => false, 'message' => 'No tens suficients xuxes a la motxilla!'], 400);
        }

        $userItem->quantity -= $request->cantidad;
        if ($userItem->quantity <= 0) {
            $userItem->delete(); 
        } else {
            $userItem->save();
        }

        // 3. Sistema d'infecció probabilístic (per cada xuxe)
        for ($i = 0; $i < $request->cantidad; $i++) {
            $rand = rand(1, 100);
            if ($rand <= 5) {
                $userXuxemon->enfermedad = 'Bajón de azúcar';
            } elseif ($rand > 5 && $rand <= 15) {
                $userXuxemon->enfermedad = 'Sobredosis de sucre';
            } elseif ($rand > 15 && $rand <= 30) {
                $userXuxemon->enfermedad = 'Atracón';
            }
        }

        // 4. Lògica d'Evolució
        $userXuxemon->xuxes_comidas += $request->cantidad;

        $xuxesNecessaries = 999; 
        if ($userXuxemon->size === 'Pequeño') {
            $xuxesNecessaries = 3;
        } elseif ($userXuxemon->size === 'Mediano') {
            $xuxesNecessaries = 5;
        }

        if ($userXuxemon->enfermedad === 'Bajón de azúcar') {
            $xuxesNecessaries += 2;
        }

        $missatge = 'Xuxemon alimentat correctament.';

        if ($userXuxemon->size !== 'Grande' && $userXuxemon->xuxes_comidas >= $xuxesNecessaries) {
            $userXuxemon->size = ($userXuxemon->size === 'Pequeño') ? 'Mediano' : 'Grande';
            $userXuxemon->xuxes_comidas = 0; 
            $missatge = 'El teu Xuxemon ha evolucionat a mida ' . $userXuxemon->size . '!';
        } elseif ($userXuxemon->size === 'Grande') {
            $missatge = 'El teu Xuxemon ja és de mida màxima, però ha disfrutat el menjar.';
        }

        $userXuxemon->save();

        return response()->json([
            'success' => true,
            'message' => $missatge,
            'xuxemon' => $userXuxemon
        ]);
    }

    // ========== NIVELL 3: APLICAR VACUNES ==========
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

        // No utilitzem with() perquè llegim directament la taula user_items
        $userItem = UserItem::where('id', $request->user_item_id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        // Llegim la columna 'name'
        $nomVacuna = $userItem->name;
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

            // Usem 'quantity' per restar
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
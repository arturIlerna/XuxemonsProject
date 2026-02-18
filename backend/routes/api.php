<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\XuxemonController;
use App\Http\Controllers\BattleController;

// Ruta que permite registrar usuarios desde Angular o Postman
Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:api'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/me', [AuthController::class, 'me']);
    
    Route::get('/xuxemons', [XuxemonController::class, 'index']);
    Route::get('/xuxemons/mis-xuxemons', [XuxemonController::class, 'myXuxemons']);
    Route::post('/xuxemons', [XuxemonController::class, 'store']);
    Route::get('/xuxemons/{id}', [XuxemonController::class, 'show']);
    Route::put('/xuxemons/{id}', [XuxemonController::class, 'update']);
    Route::delete('/xuxemons/{id}', [XuxemonController::class, 'destroy']);
    
    Route::post('/battles/start', [BattleController::class, 'start']);
    Route::post('/battles/{id}/attack', [BattleController::class, 'attack']);
    Route::get('/battles/history', [BattleController::class, 'history']);
    
    Route::get('/dashboard', function () {
        return response()->json([
            'message' => 'Bienvenido al dashboard',
            'user' => auth()->user()
        ]);
    });
});

Route::get('/health', function () {
    return response()->json(['status' => 'OK', 'message' => 'API funcionando correctamente']);
});
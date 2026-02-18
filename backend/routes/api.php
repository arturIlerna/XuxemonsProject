<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Ruta que permite registrar usuarios desde Angular o Postman
Route::post('/register', [AuthController::class, 'register']);
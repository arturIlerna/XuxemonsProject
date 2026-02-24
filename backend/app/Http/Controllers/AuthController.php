<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Validación de los campos nivel 1
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        // El primero que se registra es ADMIN automáticamente
        $role = User::count() === 0 ? 'admin' : 'player';

        // Generar ID aleatorio formato #NomXXXX
        $randomNumber = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
        $xuxe_id = "#" . $request->name . $randomNumber;

        // Crear el usuario
        $user = User::create([
            'xuxe_id' => $xuxe_id,
            'name' => $request->name,
            'lastname' => $request->lastname,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $role,
        ]);

        return response()->json([
            'message' => 'Usuario registrado con éxito',
            'user' => $user
        ], 201);
    }

    public function login(Request $request)
    {
        // Validar que entrada email y password
        $credentials = $request->only('email', 'password');

        // Intentar autenticar: Si falla, devolvemos error 401
        if (!$token = auth()->attempt($credentials)){
            return response()->json(['error' => 'Credenciales inválidas'], 401);
        }

        // Si todo esta bien, devolvemos el token y los datos del usuario
        return $this->respondWithToken($token);
    }

    // Función de auyda para dar formato a la respuesta del Token
    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',+
            'expires_in' => auth()->factory()->getTTL() * 60,
            'user' => auth()->user()
        ]);
    }
}

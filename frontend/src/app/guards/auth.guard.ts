import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  // Inyectamos el servicio y el router (como es una función, usamos inject())
  const authService = inject(Auth);
  const router = inject(Router);

  // Comprobamos si hay un token guardado
  if (authService.getToken()) {
    return true; // Te deja pasar al Dashboard.
  } else {
    // Si no hay token, te manda de vuelta al Login
    router.navigate(['/login']);
    return false; // Bloquea el acceso a la ruta prohibida.
  }
};
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Inyectamos el servicio de autenticación
  const authService = inject(Auth);
  
  // Recojemos el token
  const token = authService.getToken();

  // Si tenemos token, clonamos la petición y le ponemos la cabecera de seguridad
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq); // Enviamos la petición modificada
  }

  // Si no hay token (ej. al hacer login o registro), la dejamos pasar tal cual
  return next(req);
};
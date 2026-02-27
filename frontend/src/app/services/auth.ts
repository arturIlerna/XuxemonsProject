import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth { 
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Función para enviar los datos al backend de Laravel
  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => { // logica para guardar el token y el usuario en el localStorage del navegador
        // Si Laravel nos devuelve el token
        if (res.access_token) {
          localStorage.setItem('token', res.access_token);
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      })
    );
  }

  // Función para registrar un nuevo usuario
  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      tap((res) => {
        // Si Laravel nos devuelve el token al registrar, lo guardamos y hacemos autologin
        if (res.access_token) {
          localStorage.setItem('token', res.access_token);
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      })
    );
  }

  // Función para saber si estamos logueados
  getToken() {
    return localStorage.getItem('token');
  }
  
  // Función para cerrar sesión
  logout() {
    // Borramos el token y los datos del usuario del navegador
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}
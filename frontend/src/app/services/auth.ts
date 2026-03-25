import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject, tap } from 'rxjs'; // <-- Importamos el BehaviorSubject

@Injectable({
  providedIn: 'root',
})
export class Auth { 
  private apiUrl = environment.apiUrl;

  // 1. CREAMOS EL BEHAVIORSUBJECT 
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser$: Observable<any>; // El $ al final es una convención para los Observables

  constructor(private http: HttpClient) {
    // 2. INICIALIZAMOS CON LOS DATOS GUARDADOS (Si recargamos la página, no perdemos la sesión)
    const storedUser = localStorage.getItem('user');
    this.currentUserSubject = new BehaviorSubject<any>(storedUser ? JSON.parse(storedUser) : null);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  // Getter opcional para obtener el valor instantáneo sin suscribirse
  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        if (res.access_token) {
          localStorage.setItem('token', res.access_token);
          localStorage.setItem('user', JSON.stringify(res.user));
          
          // 3. EMITIMOS AL USUARIO POR LA RADIO
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      tap((res) => {
        if (res.access_token) {
          localStorage.setItem('token', res.access_token);
          localStorage.setItem('user', JSON.stringify(res.user));
          
          // ACTUALIZAMOS EL BEHAVIORSUBJECT
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // 4. AL SALIR, EMITIMOS UN "NULL" PARA QUE LA WEB SEPA QUE NO HAY NADIE
    this.currentUserSubject.next(null);
  }

  deleteAccount(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }
  
  updateProfile(userId: number, userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${userId}`, userData).pipe(
      tap((res) => {
        // 5. SI ACTUALIZA SUS DATOS, LOS GUARDAMOS Y LOS EMITIMOS
        if (res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }
  
  // Función para pedirle al backend todos los usuarios registrados
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }

  // Función para pedir los Xuxemons
  getAllXuxemons(): Observable<any> {
    return this.http.get(`${this.apiUrl}/xuxemons`);
  }

  // Dar un Xuxemon aleatorio
  giveRandomXuxemon(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/give-xuxemon`, { user_id: userId });
  }

  // Dar Chuches a un usuario
  giveXuxes(userId: number, name: string, quantity: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/give-xuxes`, {
      user_id: userId,
      name: name,
      quantity: quantity
    });
  }
  
  // Obtener mi mochila real desde Laravel
  getMyInventory(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-inventory`);
  }
}
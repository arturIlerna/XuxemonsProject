import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject, tap } from 'rxjs'; 

@Injectable({
  providedIn: 'root',
})
export class Auth { 
  private apiUrl = environment.apiUrl;

  private currentUserSubject: BehaviorSubject<any>;
  public currentUser$: Observable<any>;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('user');
    this.currentUserSubject = new BehaviorSubject<any>(storedUser ? JSON.parse(storedUser) : null);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        if (res.access_token) {
          localStorage.setItem('token', res.access_token);
          localStorage.setItem('user', JSON.stringify(res.user));
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
    this.currentUserSubject.next(null);
  }

  deleteAccount(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }
  
  updateProfile(userId: number, userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${userId}`, userData).pipe(
      tap((res) => {
        if (res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }
  
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }

  getAllXuxemons(type: string = 'todos', size: string = 'todas'): Observable<any> {
    let params = new HttpParams();
    if (type !== 'todos') {
      params = params.set('type', type);
    }
    if (size !== 'todas') {
      params = params.set('size', size);
    }
    return this.http.get(`${this.apiUrl}/xuxemons`, { params });
  }

  giveRandomXuxemon(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/give-xuxemon`, { user_id: userId });
  }

  giveXuxes(userId: number, name: string, quantity: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/give-xuxes`, {
      user_id: userId,
      name: name,
      quantity: quantity
    });
  }

  // ========== NUEVO: DAR VACUNAS ==========
  giveVacunas(userId: number, name: string, quantity: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/give-vacunas`, {
      user_id: userId,
      name: name,
      quantity: quantity
    });
  }
  
  getMyInventory(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-inventory`);
  }

  getMyXuxemons(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-xuxemons`);
  }

  getItems(): Observable<any> {
    return this.http.get(`${this.apiUrl}/items`);
  }

  useItem(itemId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/my-inventory/use/${itemId}`, {});
  }

  throwItem(itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/my-inventory/${itemId}`);
  }

  getConfiguraciones(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/admin/config`, { headers });
  }

  updateConfiguraciones(data: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/admin/config`, data, { headers });
  }

  // ========== EVOLUCIÓN DE XUXEMON ==========
  evolveXuxemon(userXuxemonId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/evolve/${userXuxemonId}`, {});
  }

  // ========== ALIMENTAR XUXEMON ==========
  feedXuxemon(userXuxemonId: number, userItemId: number, cantidad: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/evolve/${userXuxemonId}/feed`, {
      user_item_id: userItemId,
      cantidad: cantidad
    });
  }

  // ========== CURAR XUXEMON ==========
  healXuxemon(userXuxemonId: number, userItemId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/evolve/${userXuxemonId}/heal`, {
      user_item_id: userItemId
    });
  }
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FriendService {
  private apiUrl = environment.apiUrl;
  
  private pendingCountSubject = new BehaviorSubject<number>(0);
  public pendingCount$ = this.pendingCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  searchUsers(query: string): Observable<any> {
    const params = new HttpParams().set('query', query);
    return this.http.get(`${this.apiUrl}/friends/search`, { params });
  }

  sendRequest(friendId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/friends/request`, { friend_id: friendId });
  }

  acceptRequest(friendshipId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/friends/accept/${friendshipId}`, {});
  }

  rejectRequest(friendshipId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/friends/reject/${friendshipId}`);
  }

  removeFriend(friendshipId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/friends/remove/${friendshipId}`);
  }

  getPendingRequests(): Observable<any> {
    return this.http.get(`${this.apiUrl}/friends/pending`);
  }

  getFriendsList(): Observable<any> {
    return this.http.get(`${this.apiUrl}/friends`);
  }

  getPendingCount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/friends/pending/count`);
  }

  updatePendingCount(count: number) {
    this.pendingCountSubject.next(count);
  }

  refreshPendingCount() {
    this.getPendingCount().subscribe({
      next: (res: any) => {
        this.pendingCountSubject.next(res.count);
      }
    });
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FriendService } from '../../services/friend.service';
import { Auth } from '../../services/auth';
import { debounceTime, distinctUntilChanged, filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './friends.html',
  styleUrls: ['./friends.css']
})
export class FriendsComponent implements OnInit, OnDestroy {
  
  userName: string = '';
  
  searchControl = new FormControl('');
  searchResults: any[] = [];
  searching = false;
  
  pendingRequests: any[] = [];
  friendsList: any[] = [];
  
  loadingPending = false;
  loadingFriends = false;
  
  private subscriptions: Subscription = new Subscription();

  constructor(
    private friendService: FriendService,
    private authService: Auth
  ) {}

  ngOnInit() {
    this.loadUserInfo();
    this.loadPendingRequests();
    this.loadFriendsList();
    
    this.subscriptions.add(
      this.searchControl.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          filter(query => query !== null && query.trim().length >= 3)
        )
        .subscribe(query => {
          this.searchUsers(query!);
        })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadUserInfo() {
    const user = this.authService.getUser();
    if (user) {
      this.userName = user.name || user.xuxe_id || 'Usuario';
    }
  }

  loadPendingRequests() {
    this.loadingPending = true;
    this.friendService.getPendingRequests().subscribe({
      next: (data: any) => {
        this.pendingRequests = data;
        this.loadingPending = false;
        this.friendService.updatePendingCount(data.length);
      },
      error: (err) => {
        console.error('Error cargando solicitudes:', err);
        this.loadingPending = false;
      }
    });
  }

  loadFriendsList() {
    this.loadingFriends = true;
    this.friendService.getFriendsList().subscribe({
      next: (data: any) => {
        this.friendsList = data;
        this.loadingFriends = false;
      },
      error: (err) => {
        console.error('Error cargando amigos:', err);
        this.loadingFriends = false;
      }
    });
  }

  searchUsers(query: string) {
    this.searching = true;
    this.friendService.searchUsers(query).subscribe({
      next: (data: any) => {
        this.searchResults = data;
        this.searching = false;
      },
      error: (err) => {
        console.error('Error en búsqueda:', err);
        this.searching = false;
      }
    });
  }

  sendRequest(friendId: number) {
    this.friendService.sendRequest(friendId).subscribe({
      next: () => {
        alert('✅ Solicitud enviada');
        const user = this.searchResults.find(u => u.id === friendId);
        if (user) {
          user.friendship_status = 'pending';
        }
      },
      error: (err) => {
        alert(err.error?.error || '❌ Error al enviar solicitud');
      }
    });
  }

  acceptRequest(friendshipId: number) {
    this.friendService.acceptRequest(friendshipId).subscribe({
      next: () => {
        alert('✅ Solicitud aceptada');
        this.loadPendingRequests();
        this.loadFriendsList();
        this.friendService.refreshPendingCount();
      },
      error: () => {
        alert('❌ Error al aceptar solicitud');
      }
    });
  }

  rejectRequest(friendshipId: number) {
    if (confirm('¿Rechazar esta solicitud?')) {
      this.friendService.rejectRequest(friendshipId).subscribe({
        next: () => {
          alert('✅ Solicitud rechazada');
          this.loadPendingRequests();
          this.friendService.refreshPendingCount();
        },
        error: () => {
          alert('❌ Error al rechazar solicitud');
        }
      });
    }
  }

  removeFriend(friend: any) {
    const friendshipId = friend.friendship_id || friend.pivot?.friendship_id;
    if (!friendshipId) {
      alert('Error: No se puede eliminar este amigo');
      return;
    }
    
    if (confirm(`¿Eliminar a ${friend.xuxe_id || friend.name} de tus amigos?`)) {
      this.friendService.removeFriend(friendshipId).subscribe({
        next: () => {
          alert('✅ Amigo eliminado');
          this.loadFriendsList();
        },
        error: () => {
          alert('❌ Error al eliminar amigo');
        }
      });
    }
  }

  getFriendshipStatus(user: any): string {
    if (user.friendship_status === 'pending') return '⏳ Solicitud enviada';
    if (user.friendship_status === 'accepted') return '👥 Amigo';
    return '+ Enviar solicitud';
  }

  canSendRequest(user: any): boolean {
    return !user.friendship_status || user.friendship_status !== 'pending';
  }

  logout() {
    this.authService.logout();
    window.location.href = '/login';
  }
}
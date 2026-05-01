import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Auth } from '../../services/auth';
import { FriendService } from '../../services/friend.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  
  // Variables principales
  userName: string = '';
  totalXuxes: number = 0;
  totalXuxemons: number = 0;
  isLoading: boolean = true;
  pendingCount$: Observable<number>;

  // ========== Variables para el Pop-up de Recompensas ==========
  showRewardModal: boolean = false;
  dailyXuxesQuantity: number = 0;
  dailyXuxesName: string = '';
  dailyXuxemonName: string = '';

  constructor(
    private authService: Auth,
    private friendService: FriendService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.pendingCount$ = this.friendService.pendingCount$;
  }

  ngOnInit() {
    this.cargarUserInfo();
    this.cargarTotalXuxes();
    this.cargarTotalXuxemons();
    this.friendService.refreshPendingCount();
    
    // --- LÍNEA PARA PROBAR EL POPUP MIENTRAS LO CONECTAMOS A LARAVEL ---
    this.checkDailyRewards(); 
  }

  cargarUserInfo() {
    const user = this.authService.getUser();
    if (user) {
      // Priorizamos el xuxe_id para que se muestre #nombre0000
      this.userName = user.xuxe_id || user.name || 'Usuario';
    }
  }

  cargarTotalXuxes() {
    this.authService.getMyInventory().subscribe({
      next: (data: any) => {
        let items: any[] = [];
        
        if (Array.isArray(data)) {
          items = data;
        } else if (data && Array.isArray(data.data)) {
          items = data.data;
        } else if (data && typeof data === 'object') {
          items = [];
        }
        
        this.totalXuxes = items.reduce((total: number, item: any) => {
          if (item.name && item.name.toLowerCase().includes('xuxe')) {
            return total + (item.quantity || 0);
          }
          return total;
        }, 0);
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error cargando Xuxes:', err);
        this.totalXuxes = 0;
        this.isLoading = false;
      }
    });
  }

  cargarTotalXuxemons() {
    this.authService.getMyXuxemons().subscribe({
      next: (data: any) => {
        let xuxemons: any[] = [];
        
        if (Array.isArray(data)) {
          xuxemons = data;
        } else if (data && Array.isArray(data.data)) {
          xuxemons = data.data;
        } else if (data && typeof data === 'object') {
          xuxemons = [];
        }
        
        this.totalXuxemons = xuxemons.length;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error cargando Xuxemons:', err);
        this.totalXuxemons = 0;
      }
    });
  }

  // ========== Funciones del Pop-up de Recompensas ==========
  checkDailyRewards() {
    // Simulamos que el backend nos avisa de los regalos (DATOS FALSOS TEMPORALES)
    setTimeout(() => {
      this.dailyXuxesQuantity = 10;
      this.dailyXuxesName = 'Xuxe de Fresa';
      this.dailyXuxemonName = 'Charmander';
      this.showRewardModal = true;
      
      // Aseguramos que Angular refresque la vista para mostrar el modal
      this.cdr.detectChanges(); 
    }, 500); // Aparece medio segundo después de cargar el dashboard
  }

  closeRewardModal() {
    this.showRewardModal = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
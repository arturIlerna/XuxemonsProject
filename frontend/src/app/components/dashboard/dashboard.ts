import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Observable } from 'rxjs';  // ← NUEVO
import { Auth } from '../../services/auth';
import { FriendService } from '../../services/friend.service';  // ← NUEVO

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  
  userName: string = '';
  totalXuxes: number = 0;
  totalXuxemons: number = 0;
  totalCaramelos: number = 0;
  isLoading: boolean = true;
  pendingCount$: Observable<number>;  // ← NUEVO

  constructor(
    private authService: Auth,
    private friendService: FriendService,  // ← NUEVO
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.pendingCount$ = this.friendService.pendingCount$;  // ← NUEVO
  }

  ngOnInit() {
    this.cargarUserInfo();
    this.cargarTotalXuxes();
    this.cargarTotalXuxemons();
    this.cargarTotalCaramelos();
    this.friendService.refreshPendingCount();  // ← NUEVO
  }

  // ... el resto de tu código se queda igual ...
  
  cargarUserInfo() {
    const user = this.authService.getUser();
    if (user) {
      this.userName = user.name || user.xuxe_id || 'Usuario';
    }
  }

  cargarTotalXuxes() {
    this.authService.getMyInventory().subscribe({
      next: (data: any) => {
        console.log('🔵 Datos completos del servidor:', data);
        
        let items: any[] = [];
        
        if (Array.isArray(data)) {
          items = data;
        } else if (data && Array.isArray(data.data)) {
          items = data.data;
        } else if (data && typeof data === 'object') {
          console.warn('⚠️ Formato inesperado de datos:', data);
          items = [];
        }
        
        console.log('📦 Items procesados:', items);
        
        this.totalXuxes = items.reduce((total: number, item: any) => {
          console.log('✅ Item encontrado:', item.name, 'Cantidad:', item.quantity);
          if (item.name && item.name.toLowerCase().includes('xuxe')) {
            return total + (item.quantity || 0);
          }
          return total;
        }, 0);
        
        console.log('✅ Xuxes totales calculados:', this.totalXuxes);
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
        console.log('🔵 Datos completos de Xuxemons:', data);
        
        let xuxemons: any[] = [];
        
        if (Array.isArray(data)) {
          xuxemons = data;
        } else if (data && Array.isArray(data.data)) {
          xuxemons = data.data;
        } else if (data && typeof data === 'object') {
          console.warn('⚠️ Formato inesperado de Xuxemons:', data);
          xuxemons = [];
        }
        
        console.log('📚 Xuxemons procesados:', xuxemons);
        this.totalXuxemons = xuxemons.length;
        console.log('✅ Total Xuxemons:', this.totalXuxemons);
        console.log('📋 Todos los items en inventario:', xuxemons.map((x: any) => x.name || 'sin nombre'));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error cargando Xuxemons:', err);
        this.totalXuxemons = 0;
      }
    });
  }

  cargarTotalCaramelos() {
    this.authService.getMyInventory().subscribe({
      next: (data: any) => {
        let items: any[] = [];
        
        if (Array.isArray(data)) {
          items = data;
        } else if (data && Array.isArray(data.data)) {
          items = data.data;
        }
        
        console.log('🍬 Items en inventario para Caramelos:', items);
        console.log('📋 TODOS LOS NOMBRES DE ITEMS:', items.map((i: any) => i.name));
        
        this.totalCaramelos = items.reduce((total: number, item: any) => {
          const nombreLower = (item.name || '').toLowerCase();
          if (nombreLower.includes('caramelo') || nombreLower.includes('candy') || 
              nombreLower.includes('dulce') || nombreLower.includes('sweet') || 
              nombreLower.includes('caramel')) {
            console.log('✅ Caramelo encontrado:', item.name, 'Cantidad:', item.quantity);
            return total + (item.quantity || 0);
          }
          return total;
        }, 0);
        
        console.log('✅ Total Caramelos:', this.totalCaramelos);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error cargando Caramelos:', err);
        this.totalCaramelos = 0;
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
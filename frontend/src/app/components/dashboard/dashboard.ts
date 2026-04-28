import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Auth } from '../../services/auth';  // Asegúrate que la ruta sea correcta


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  
  userName: string = '';
  totalXuxes: number = 0;  // ← Variable para los Xuxes
  totalXuxemons: number = 0;  // ← Variable para los Xuxemons
  totalCaramelos: number = 0;  // ← Variable para los Caramelos
  isLoading: boolean = true;

  constructor(
    private authService: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarUserInfo();
    this.cargarTotalXuxes();  // ← Cargar los Xuxes
    this.cargarTotalXuxemons();  // ← Cargar los Xuxemons
    this.cargarTotalCaramelos();  // ← Cargar los Caramelos
  }

  cargarUserInfo() {
    const user = this.authService.getUser();
    if (user) {
      this.userName = user.name || user.xuxe_id || 'Usuario';
    }
  }

  // ← NUEVO MÉTODO: Cargar total de Xuxes del usuario
  cargarTotalXuxes() {
    this.authService.getMyInventory().subscribe({
      next: (data: any) => {
        console.log('🔵 Datos completos del servidor:', data);
        
        let items: any[] = [];
        
        // Manejar diferentes formatos de respuesta
        if (Array.isArray(data)) {
          items = data;
        } else if (data && Array.isArray(data.data)) {
          items = data.data;
        } else if (data && typeof data === 'object') {
          console.warn('⚠️ Formato inesperado de datos:', data);
          items = [];
        }
        
        console.log('📦 Items procesados:', items);
        
        // Sumar todas las cantidades de Xuxes
        this.totalXuxes = items.reduce((total: number, item: any) => {
          console.log('✅ Item encontrado:', item.name, 'Cantidad:', item.quantity);
          if (item.name && item.name.toLowerCase().includes('xuxe')) {
            return total + (item.quantity || 0);
          }
          return total;
        }, 0);
        
        console.log('✅ Xuxes totales calculados:', this.totalXuxes);
        this.isLoading = false;
        this.cdr.detectChanges();  // ← Fuerza actualización de la vista
      },
      error: (err) => {
        console.error('❌ Error cargando Xuxes:', err);
        this.totalXuxes = 0;
        this.isLoading = false;
      }
    });
  }

  // ← NUEVO MÉTODO: Cargar total de Xuxemons del usuario
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
        // Mostrar todos los nombres para ver cuales son caramelos
        console.log('📋 Todos los items en inventario:', xuxemons.map((x: any) => x.name || 'sin nombre'));
        this.cdr.detectChanges();  // ← Fuerza actualización de la vista
      },
      error: (err) => {
        console.error('❌ Error cargando Xuxemons:', err);
        this.totalXuxemons = 0;
      }
    });
  }

  // ← NUEVO MÉTODO: Cargar total de Caramelos del usuario
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
        
        // Buscar el item de Caramelos
        this.totalCaramelos = items.reduce((total: number, item: any) => {
          // Buscar cualquier item que contenga "caramelo", "candy", "dulce", "sweet" o "caramel"
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
        this.cdr.detectChanges();  // ← Fuerza actualización de la vista
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
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Auth } from '../../services/auth';

// Definimos la estructura visual de cada hueco de la mochila
export interface Slot {
  id: number; // El número de casilla (1-20)
  dbId?: number; // El ID real de la base de datos para poder borrar/modificar
  item: any | null;
  quantity: number;
}

@Component({
  selector: 'app-mochila',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mochila.html',
  styleUrl: './mochila.css'
})
export class Mochila implements OnInit, OnDestroy {
  slots: Slot[] = [];
  userName: string = 'Entrenador';
  
  private authSub!: Subscription;
  private invSub!: Subscription;

  constructor(
    private authService: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    // 1. Cargamos el nombre del usuario para el menú
    this.authSub = this.authService.currentUser$.subscribe(user => {
      if (user && user.name) {
        this.userName = user.name;
      }
    });

    // 2. Pedimos los datos reales a Laravel
    this.loadInventory();
  }

  // --- Función para recargar la mochila al usar chuches ---
  loadInventory() {
    this.invSub = this.authService.getMyInventory().subscribe({
      next: (data: any) => {
        // Generamos SIEMPRE los 20 slots vacíos obligatorios
        let realSlots: Slot[] = Array.from({ length: 20 }, (_, index) => ({
          id: index + 1,
          item: null,
          quantity: 0
        }));

        const items = Array.isArray(data) ? data : (data.data || []);
        
        // Rellenamos los huecos ocupados
        items.forEach((dbItem: any) => {
           const arrayIndex = dbItem.slot - 1; 
           if (arrayIndex >= 0 && arrayIndex < 20) {
               realSlots[arrayIndex] = {
                   id: dbItem.slot,
                   dbId: dbItem.id, // Guardamos el ID real de Laravel
                   item: { 
                     name: dbItem.name, 
                     type: dbItem.type === 'apilable' ? 'xuxe' : 'vacuna', 
                     icon: dbItem.type === 'apilable' ? '🍬' : '💉'
                   },
                   quantity: dbItem.quantity
               };
           }
        });

        this.slots = realSlots;
        this.cdr.detectChanges(); 
      },
      // SOLUCIONADO: Añadido : any
      error: (err: any) => console.error("❌ Error cargando la mochila desde Laravel:", err)
    });
  }

  // --- Función para USAR/GASTAR una chuche ---
  usarObjeto(slot: Slot) {
    if (!slot.dbId) return; // Por si acaso tocamos un slot vacío

    this.authService.useItem(slot.dbId).subscribe({
      next: (res: any) => {
        // Mostramos el mensaje que nos envía Laravel ("Objeto usado...")
        console.log('🍬', res.message);
        
        // ¡Recargamos la mochila para que se vea que hay 1 chuche menos!
        this.loadInventory(); 
      },
      // SOLUCIONADO: Añadido : any
      error: (err: any) => alert('Error al usar el objeto. Revisa la consola.')
    });
  }

  // --- Función para TIRAR una chuche a la basura ---
  tirarObjeto(slot: Slot) {
    if (!slot.dbId || !slot.item) return;

    if (confirm(`🗑️ ¿Seguro que quieres tirar ${slot.quantity}x ${slot.item.name}? No se puede deshacer.`)) {
      this.authService.throwItem(slot.dbId).subscribe({
        next: (res: any) => {
          // Recargamos la mochila para que el cuadrado vuelva a quedar vacío
          this.loadInventory();
        },
        // SOLUCIONADO: Añadido : any
        error: (err: any) => alert('Error al tirar el objeto.')
      });
    }
  }

  ngOnDestroy() {
    if (this.invSub) this.invSub.unsubscribe();
    if (this.authSub) this.authSub.unsubscribe();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
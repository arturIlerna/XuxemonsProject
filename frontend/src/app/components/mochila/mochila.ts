import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Auth } from '../../services/auth';

// Definimos la estructura visual de cada hueco de la mochila
export interface Slot {
  id: number;
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
    private cdr: ChangeDetectorRef // Usamos esto para obligar a redibujar la pantalla
  ) {}

  ngOnInit() {
    // 1. Cargamos el nombre del usuario para el menú
    this.authSub = this.authService.currentUser$.subscribe(user => {
      if (user && user.name) {
        this.userName = user.name;
      }
    });

    // 2. Pedimos los datos reales a Laravel
    this.invSub = this.authService.getMyInventory().subscribe({
      next: (data: any) => {
        // Generamos SIEMPRE los 20 slots vacíos obligatorios
        let realSlots: Slot[] = Array.from({ length: 20 }, (_, index) => ({
          id: index + 1,
          item: null,
          quantity: 0
        }));

        // Extraemos los items que nos envíe Laravel (si es nuevo, vendrá vacío)
        const items = Array.isArray(data) ? data : (data.data || []);
        
        // Rellenamos los huecos ocupados
        items.forEach((dbItem: any) => {
           const arrayIndex = dbItem.slot - 1; // El slot 1 de BD es la posición 0 del array
           if (arrayIndex >= 0 && arrayIndex < 20) {
               realSlots[arrayIndex] = {
                   id: dbItem.slot,
                   item: { 
                     name: dbItem.name, 
                     type: dbItem.type === 'apilable' ? 'xuxe' : 'vacuna', 
                     icon: dbItem.type === 'apilable' ? '🍬' : '💉' // Ponemos un icono chulo
                   },
                   quantity: dbItem.quantity
               };
           }
        });

        // Aplicamos los cambios y forzamos el redibujado
        this.slots = realSlots;
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error("❌ Error cargando la mochila desde Laravel:", err)
    });
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
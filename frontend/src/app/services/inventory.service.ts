import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface Item {
  id: number;
  name: string;
  type: 'apilable' | 'no apilable'; // Exactament com a la base de dades
  icon?: string; // Opcional
}

export interface Slot {
  id: number; // Del 0 al 19 (los 20 huecos de la rúbrica[cite: 2])
  item: Item | null; 
  quantity: number; 
  user_item_id?: number; // CRUCIAL: El ID real de la tabla user_items en Laravel
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = 'http://localhost:8000/api'; // Ajusta si tu API tiene otra URL

  // 1. Creamos la mochila vacía con exactamente 20 huecos (Grid 4x5)[cite: 2]
  private initialSlots: Slot[] = Array.from({ length: 20 }, (_, index) => ({
    id: index,
    item: null,
    quantity: 0
  }));

  private inventorySubject = new BehaviorSubject<Slot[]>(this.initialSlots);
  public inventory$ = this.inventorySubject.asObservable();

  constructor(private http: HttpClient) {
    this.cargarInventarioReal();
  }

  // Sustituimos los datos de prueba por la BD real
  cargarInventarioReal() {
    this.http.get<any[]>(`${this.apiUrl}/my-inventory`).subscribe({
      next: (data) => {
        // AFEGIM ": Slot[]" AQUÍ 👇 PERQUÈ TS SÀPIGA QUE POT SER NULL O UN ITEM
        const slots: Slot[] = [...this.initialSlots.map(slot => ({...slot, item: null, quantity: 0, user_item_id: undefined}))];
        
        data.forEach((userItem, index) => {
          if (index < 20) {
            slots[index] = {
              id: index,
              item: { 
                id: userItem.id, 
                name: userItem.name, 
                type: userItem.type as 'apilable' | 'no apilable', 
                icon: userItem.type === 'apilable' ? '🍬' : '💉' 
              }, 
              quantity: userItem.quantity,
              user_item_id: userItem.id 
            };
          }
        });
        
        this.inventorySubject.next(slots);
      },
      error: (err) => console.error('Error carregant l\'inventari:', err)
    });
  }

  getInventory(): Observable<Slot[]> {
    return this.inventory$;
  }
}
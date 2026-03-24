import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // cdr para mostrar definitivamente los puñeteros usuarios :)
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth'; 

// Actualizamos la interfaz para que coincida con tu base de datos
export interface UserData {
  id: number;
  name: string;
  lastname: string; 
  email: string;
  role: string;
  xuxe_id: string; 
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {
  
  users: UserData[] = [];

  // Añadimos el cdr (porque no mostraba la puñetera lista de usuarios y con esto actualizamos de nuevo) al constructor y el auth
  constructor(
    private router: Router, 
    private authService: Auth,
    private cdr: ChangeDetectorRef 
  ) {}
  
  ngOnInit() {
    this.authService.getAllUsers().subscribe({
      next: (data: any) => {
        // Tu filtro actual...
        if (Array.isArray(data)) {
          this.users = data;
        } else if (data && data.data) {
          this.users = data.data;
        } else if (data && data.users) {
          this.users = data.users;
        } else {
          this.users = Object.values(data); 
        }

        console.log('✅ ARRAY FINAL PARA EL HTML:', this.users);

        // Obligamos a Angular a pintar la santa tabla de usuarios
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('❌ Error al cargar usuarios:', err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  // --- FUNCIONES DE LOS BOTONES ---

  // Regalar Xuxemon
  darXuxemon(user: UserData) {
    if(confirm(`¿Seguro que quieres regalar un Xuxemon aleatorio a ${user.name}?`)) {
      this.authService.giveRandomXuxemon(user.id).subscribe({
        next: (res: any) => {
          // El backend nos devuelve el nombre del bicho en res.xuxemon
          alert(`¡Éxito! Le has regalado a ${user.name} un ${res.xuxemon} 🎁`);
        },
        error: (err) => {
          console.error(err);
          alert('❌ Error al regalar el Xuxemon. Comprueba la consola.');
        }
      });
    }
  }

  // Regalar Chuches
  darXuxes(user: UserData) {
    // Le preguntamos al admin cuántas chuches quiere dar
    const quantityStr = prompt(`¿Cuántas chuches quieres darle a ${user.name}?`);
    
    // Si cancela o lo deja vacío, no hacemos nada
    if (!quantityStr) return; 

    // Convertimos el texto a número
    const quantity = parseInt(quantityStr, 10);
    if (isNaN(quantity) || quantity <= 0) {
      alert('⚠️ Por favor, introduce un número válido mayor que 0.');
      return;
    }

    // Por defecto le vamos a dar "Chuche de Fresa" (puedes cambiarlo luego)
    const itemName = "Chuche de Fresa";

    this.authService.giveXuxes(user.id, itemName, quantity).subscribe({
      next: (res: any) => {
        alert(`¡Boom! 🍬 Has inyectado ${quantity} ${itemName} en la mochila de ${user.name}.`);
      },
      error: (err) => {
        console.error(err);
        alert('❌ Error al dar chuches. Comprueba la consola.');
      }
    });
  }
}
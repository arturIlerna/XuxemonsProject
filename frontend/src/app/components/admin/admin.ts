import { Component, OnInit, ChangeDetectorRef, signal } from '@angular/core'; // Añadido signal
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- MUY IMPORTANTE AÑADIR ESTO para los ngModel
import { Router } from '@angular/router';
import { Auth } from '../../services/auth'; 

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
  imports: [CommonModule, FormsModule], // <-- NO OLVIDAR FormsModule
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {
  
  users: UserData[] = [];
  availableItems: any[] = []; // Nuestro catálogo real de chuches de Laravel
  
  // Variables para la selección global del admin
  selectedItemName: string = '';
  selectedQuantity: number = 1;

  // Señales para el modal de advertencia de Mochila Llena
  public showWarningModal = signal<boolean>(false);
  public warningMessage = signal<string>('');

  // ========== NUEVO: Configuraciones del Juego ==========
  config = {
    hora_xuxes_diarias: '08:00',
    cantidad_xuxes_diarias: 10,
    hora_xuxemon_diario: '08:00'
  };
  
  mensajeConfig: string = '';
  errorConfig: string = '';

  constructor(
    private router: Router, 
    private authService: Auth,
    private cdr: ChangeDetectorRef 
  ) {}
  
  ngOnInit() {
    this.loadUsers();
    this.loadItems(); // Cargamos el catálogo de chuches
    this.loadConfiguraciones(); // ========== NUEVO: Cargar configuraciones
  }

  loadUsers() {
    this.authService.getAllUsers().subscribe({
      next: (data: any) => {
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
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('❌ Error al cargar usuarios:', err);
      }
    });
  }

  // --- NUEVO: Cargar el catálogo de Chuches ---
  loadItems() {
    this.authService.getItems().subscribe({
      next: (items: any[]) => {
        this.availableItems = items;
        // Seleccionamos la primera por defecto si existen
        if (items.length > 0) {
          this.selectedItemName = items[0].name;
        }
      },
      error: (err) => {
        console.error('❌ Error al cargar el catálogo de chuches:', err);
      }
    });
  }

  // ========== NUEVO: Cargar configuraciones del juego ==========
  loadConfiguraciones() {
    this.authService.getConfiguraciones().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            if (item.clave === 'hora_xuxes_diarias') {
              this.config.hora_xuxes_diarias = JSON.parse(item.valor);
            } else if (item.clave === 'cantidad_xuxes_diarias') {
              this.config.cantidad_xuxes_diarias = JSON.parse(item.valor);
            } else if (item.clave === 'hora_xuxemon_diario') {
              this.config.hora_xuxemon_diario = JSON.parse(item.valor);
            }
          });
        }
      },
      error: (err) => {
        console.error('❌ Error al cargar configuraciones:', err);
      }
    });
  }

  // ========== NUEVO: Guardar configuraciones ==========
  guardarConfiguracion() {
    this.authService.updateConfiguraciones(this.config).subscribe({
      next: (res: any) => {
        this.mensajeConfig = '✅ Configuración guardada correctamente';
        this.errorConfig = '';
        setTimeout(() => this.mensajeConfig = '', 3000);
      },
      error: (err) => {
        this.errorConfig = '❌ Error al guardar configuración';
        this.mensajeConfig = '';
        console.error(err);
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
          alert(`¡Éxito! Le has regalado a ${user.name} un ${res.xuxemon} 🎁`);
        },
        error: (err) => {
          console.error(err);
          alert('❌ Error al regalar el Xuxemon. Comprueba la consola.');
        }
      });
    }
  }

  // Regalar Chuches (Actualizado)
  darXuxes(user: UserData) {
    // Validaciones previas
    if (!this.selectedItemName) {
      alert('⚠️ Por favor, selecciona una chuche del catálogo arriba.');
      return;
    }
    
    if (this.selectedQuantity <= 0) {
      alert('⚠️ Por favor, introduce un número válido mayor que 0.');
      return;
    }

    // Ya no usamos prompt(), cogemos los datos del menú superior que hemos creado
    this.authService.giveXuxes(user.id, this.selectedItemName, this.selectedQuantity).subscribe({
      next: (res: any) => {
        if (res.discarded) {
          // Si Laravel nos chiva que se han tirado chuches a la basura, abrimos el Modal Rojo
          this.warningMessage.set(res.message);
          this.showWarningModal.set(true);
        } else {
          // Si ha cabido todo, damos el OK genérico
          alert(`¡Boom! 🍬 ${res.message}`);
        }
      },
      error: (err) => {
        console.error(err);
        alert('❌ Error al dar chuches. Comprueba la consola.');
      }
    });
  }

  // Cerrar el Modal de Advertencia
  closeWarning() {
    this.showWarningModal.set(false);
  }
}
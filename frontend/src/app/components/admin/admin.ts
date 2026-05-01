import { Component, OnInit, ChangeDetectorRef, signal } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
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
  imports: [CommonModule, FormsModule], 
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {
  
  users: UserData[] = [];
  
  // Listas separadas para Chuches y Vacunas
  chuchesList: any[] = []; 
  vacunasList: any[] = []; 
  
  // Variables para la selección de Chuches
  selectedChucheName: string = '';
  selectedChucheQuantity: number = 1;

  // Variables para la selección de Vacunas
  selectedVacunaName: string = '';
  selectedVacunaQuantity: number = 1;

  // Señales para el modal de advertencia de Mochila Llena
  public showWarningModal = signal<boolean>(false);
  public warningMessage = signal<string>('');

  // ========== CONFIGURACIONES DEL JUEGO ==========
  config = {
    hora_xuxes_diarias: '08:00',
    cantidad_xuxes_diarias: 10,
    hora_xuxemon_diario: '08:00',
    probabilidad_infeccion: 30, // % de probabilidad por defecto
    xuxes_mediano: 3,           // Xuxes necesarias por defecto
    xuxes_grande: 5             // Xuxes necesarias por defecto
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
    this.loadItems(); 
    this.loadConfiguraciones(); 
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
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('❌ Error al cargar usuarios:', err);
      }
    });
  }

  // --- Cargar el catálogo y separar Chuches de Vacunas ---
  loadItems() {
    this.authService.getItems().subscribe({
      next: (items: any[]) => {
        // Asumimos que las chuches son 'apilable' y las vacunas 'no apilable'
        this.chuchesList = items.filter(item => item.type === 'apilable');
        this.vacunasList = items.filter(item => item.type === 'no apilable');
        
        // Seleccionamos la primera por defecto si existen
        if (this.chuchesList.length > 0) {
          this.selectedChucheName = this.chuchesList[0].name;
        }
        if (this.vacunasList.length > 0) {
          this.selectedVacunaName = this.vacunasList[0].name;
        }
      },
      error: (err) => {
        console.error('❌ Error al cargar el catálogo de items:', err);
      }
    });
  }

  // ========== Cargar configuraciones del juego ==========
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
            } else if (item.clave === 'probabilidad_infeccion') {
              this.config.probabilidad_infeccion = JSON.parse(item.valor);
            } else if (item.clave === 'xuxes_mediano') {
              this.config.xuxes_mediano = JSON.parse(item.valor);
            } else if (item.clave === 'xuxes_grande') {
              this.config.xuxes_grande = JSON.parse(item.valor);
            }
          });
        }
      },
      error: (err) => {
        console.error('❌ Error al cargar configuraciones:', err);
      }
    });
  }

  // ========== Guardar configuraciones ==========
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

  // Regalar Chuches
  darXuxes(user: UserData) {
    if (!this.selectedChucheName) {
      alert('⚠️ Por favor, selecciona una chuche del catálogo.');
      return;
    }
    
    if (this.selectedChucheQuantity <= 0) {
      alert('⚠️ Por favor, introduce un número válido mayor que 0.');
      return;
    }

    this.authService.giveXuxes(user.id, this.selectedChucheName, this.selectedChucheQuantity).subscribe({
      next: (res: any) => {
        if (res.discarded) {
          this.warningMessage.set(res.message);
          this.showWarningModal.set(true);
        } else {
          alert(`¡Boom! 🍬 ${res.message}`);
        }
      },
      error: (err) => {
        console.error(err);
        alert('❌ Error al dar chuches. Comprueba la consola.');
      }
    });
  }

  // Regalar Vacunas (NUEVO)
  darVacuna(user: UserData) {
    if (!this.selectedVacunaName) {
      alert('⚠️ Por favor, selecciona una vacuna del catálogo.');
      return;
    }
    
    if (this.selectedVacunaQuantity <= 0) {
      alert('⚠️ Por favor, introduce un número válido mayor que 0.');
      return;
    }

    // Llamaremos a giveVacunas en el AuthService
    this.authService.giveVacunas(user.id, this.selectedVacunaName, this.selectedVacunaQuantity).subscribe({
      next: (res: any) => {
        if (res.discarded) {
          this.warningMessage.set(res.message);
          this.showWarningModal.set(true);
        } else {
          alert(`¡Perfecto! 💉 ${res.message}`);
        }
      },
      error: (err) => {
        console.error(err);
        alert('❌ Error al dar la vacuna. Comprueba la consola.');
      }
    });
  }

  // Cerrar el Modal de Advertencia
  closeWarning() {
    this.showWarningModal.set(false);
  }
}
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { InventoryService, Slot } from '../../services/inventory.service';

@Component({
  selector: 'app-xuxedex',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './xuxedex.html',
  styleUrls: ['./xuxedex.css']
})
export class Xuxedex implements OnInit {
  
  userName: string = '';
  allXuxemons: any[] = [];
  myXuxemons: any[] = [];
  viewMode: 'catalogo' | 'mis-xuxemons' = 'catalogo';
  loading: boolean = false;
  error: string = '';
  searchTerm: string = '';
  selectedType: string = 'todos';
  selectedSize: string = 'todas';

  // --- VARIABLES NIVELL 3 (Inventari i Modals) ---
  xuxesDisponibles: Slot[] = [];
  vacunasDisponibles: Slot[] = [];
  xuxemonSeleccionado: any = null;
  itemSeleccionadoId: number | null = null;
  cantidadAlimentar: number = 1;
  modalAlimentarVisible: boolean = false;
  modalCurarVisible: boolean = false;
  modalAvisoVisible: boolean = false; // Nou Modal Avís
  mensajeAviso: string = ''; // Missatge per al nou modal
  mensajeError: string = '';
  mensajeExito: string = '';
  evolvingXuxemonId: number | null = null; // Per a l'animació CSS

  constructor(
    private authService: Auth,
    private router: Router,
    private inventoryService: InventoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarUserInfo();
    this.loadCatalogo();
    this.loadMyXuxemons();
    this.loadMyInventory(); // Carreguem la motxilla
  }

  cargarUserInfo() {
    const user = this.authService.getUser();
    if (user) {
      this.userName = user.name || user.xuxe_id || 'Usuario';
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  irAMochila() {
    this.router.navigate(['/inventory']);
  }

  loadCatalogo() {
    this.loading = true;
    this.authService.getAllXuxemons(this.selectedType, this.selectedSize).subscribe({
      next: (data: any) => {
        this.allXuxemons = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Error cargando catálogo';
        this.loading = false;
      }
    });
  }

  loadMyXuxemons() {
    this.authService.getMyXuxemons().subscribe({
      next: (data: any) => {
        this.myXuxemons = data;
      },
      error: (err: any) => {
        console.error('Error cargando mis Xuxemons:', err);
      }
    });
  }

  setViewMode(mode: 'catalogo' | 'mis-xuxemons') {
    this.viewMode = mode;
  }

  getCurrentList() {
    return this.viewMode === 'catalogo' ? this.allXuxemons : this.myXuxemons;
  }

  getTotalCount() {
    return this.viewMode === 'catalogo' ? this.allXuxemons.length : this.myXuxemons.length;
  }

  filterByType(type: string) {
    this.selectedType = type;
    this.loadCatalogo();
  }

  filterBySize(size: string) {
    this.selectedSize = size;
    this.loadCatalogo();
  }

  applyLocalSearch() {
    if (this.searchTerm.trim() === '') {
      this.loadCatalogo();
    } else {
      this.allXuxemons = this.allXuxemons.filter((x: any) => 
        x.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  getTypeColor(type: string): string {
    const colors: any = {
      'Agua': '#3b82f6',
      'Tierra': '#8b5cf6',
      'Aire': '#14b8a6'
    };
    return colors[type] || '#6b7280';
  }

  getTypeGradient(type: string): string {
    const gradients: any = {
      'Agua': 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      'Tierra': 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
      'Aire': 'linear-gradient(135deg, #14b8a6, #0f766e)'
    };
    return gradients[type] || 'linear-gradient(135deg, #6b7280, #4b5563)';
  }

  getSizeText(size: string): string {
    const sizes: any = {
      'Pequeño': '🐣 Pequeño',
      'Mediano': '📏 Mediano',
      'Grande': '🐉 Grande'
    };
    return sizes[size] || size;
  }

  // ====== LÒGICA NIVELL 3 (Inventari, Alimentar i Curar) ======

  loadMyInventory() {
    this.inventoryService.getInventory().subscribe(slots => {
      const itemsLlenos = slots.filter(slot => slot.item !== null);
      this.vacunasDisponibles = itemsLlenos.filter(slot => slot.item!.type === 'no apilable');
      this.xuxesDisponibles = itemsLlenos.filter(slot => slot.item!.type === 'apilable');
      this.cdr.detectChanges();
    });
  }

  abrirModalAlimentar(xuxemon: any) {
    this.mensajeError = ''; this.mensajeExito = '';
    
    // Comprovem si té Atracón obrint el Pop-up bonic en lloc d'un alert
    if (xuxemon.enfermedad === 'Atracón') {
       this.mensajeAviso = `El teu Xuxemon ${xuxemon.name} té un Atracón i no pot menjar res més! Has de curar-lo primer amb una vacuna.`;
       this.modalAvisoVisible = true;
       return;
    }
    
    this.xuxemonSeleccionado = xuxemon;
    this.itemSeleccionadoId = null;
    this.cantidadAlimentar = 1;
    this.modalAlimentarVisible = true;
  }

  abrirModalCurar(xuxemon: any) {
    this.mensajeError = ''; this.mensajeExito = '';
    
    if (!xuxemon.enfermedad) {
       this.mensajeError = 'Aquest Xuxemon està sa!';
       return;
    }
    
    this.xuxemonSeleccionado = xuxemon;
    this.itemSeleccionadoId = null;
    this.modalCurarVisible = true;
  }

  cerrarModales() {
    this.modalAlimentarVisible = false;
    this.modalCurarVisible = false;
    this.modalAvisoVisible = false;
    this.xuxemonSeleccionado = null;
  }

  calcularEvolucionPreview(): string {
    if (!this.xuxemonSeleccionado || !this.cantidadAlimentar) return '';
    
    let current = this.xuxemonSeleccionado.xuxes_comidas + this.cantidadAlimentar;
    let req = this.xuxemonSeleccionado.size === 'Pequeño' ? 3 : (this.xuxemonSeleccionado.size === 'Mediano' ? 5 : 999);
    
    if (this.xuxemonSeleccionado.enfermedad === 'Bajón de azúcar') req += 2;

    if (this.xuxemonSeleccionado.size === 'Grande') {
      return 'El teu Xuxemon ja està a la mida màxima.';
    } else if (current >= req) {
      return '✨ Amb aquesta quantitat, EVOLUCIONARÀ!';
    } else {
      return `Li faltaran ${req - current} xuxes per evolucionar.`;
    }
  }

  alimentar() {
    if (!this.itemSeleccionadoId || this.cantidadAlimentar < 1) return;
    
    this.authService.feedXuxemon(this.xuxemonSeleccionado.id, this.itemSeleccionadoId, this.cantidadAlimentar).subscribe({
      next: (res: any) => {
        this.mensajeExito = res.message;

        // Disparem l'animació CSS si evoluciona
        if (res.message && res.message.toLowerCase().includes('evolucionat')) {
          this.evolvingXuxemonId = this.xuxemonSeleccionado.id;
          setTimeout(() => this.evolvingXuxemonId = null, 2500);
        }

        this.loadMyXuxemons(); 
        this.inventoryService.cargarInventarioReal(); 
        setTimeout(() => this.cerrarModales(), 2000);
      },
      error: (err: any) => this.mensajeError = err.error?.message || 'Error a l\'alimentar'
    });
  }

  curar() {
    if (!this.itemSeleccionadoId) return;

    this.authService.healXuxemon(this.xuxemonSeleccionado.id, this.itemSeleccionadoId).subscribe({
      next: (res: any) => {
        this.mensajeExito = res.message;
        this.loadMyXuxemons(); 
        this.inventoryService.cargarInventarioReal(); 
        setTimeout(() => this.cerrarModales(), 2000);
      },
      error: (err: any) => this.mensajeError = err.error?.message || 'Error al curar'
    });
  }
}
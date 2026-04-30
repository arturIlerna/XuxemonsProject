import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Necesario para los modales
import { Auth } from '../../services/auth';
import { InventoryService, Slot } from '../../services/inventory.service';

@Component({
  selector: 'app-mis-xuxemons',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './mis-xuxemons.html',
  styleUrl: './mis-xuxemons.css'
})
export class MisXuxemons implements OnInit {
  myCollection: any[] = [];
  loading: boolean = true;
  userName: string = '';

  // Arrays filtrados de la mochila real
  xuxesDisponibles: Slot[] = [];
  vacunasDisponibles: Slot[] = [];

  // Variables para Modales
  xuxemonSeleccionado: any = null;
  itemSeleccionadoId: number | null = null; // Guardará el user_item_id
  cantidadAlimentar: number = 1;
  modalAlimentarVisible: boolean = false;
  modalCurarVisible: boolean = false;
  mensajeError: string = '';
  mensajeExito: string = '';

  constructor(
    private authService: Auth,
    private inventoryService: InventoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.userName = this.authService.getUser()?.name || 'Entrenador';
    this.loadMyXuxemons();
    this.loadMyInventory();
  }

  loadMyXuxemons() {
    this.authService.getMyXuxemons().subscribe({
      next: (data: any) => {
        this.myCollection = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error("Error carregant la col·lecció:", err);
        this.loading = false;
      }
    });
  }

  loadMyInventory() {
    this.inventoryService.getInventory().subscribe(slots => {
      // Filtrem només els forats que tenen objectes
      const itemsLlenos = slots.filter(slot => slot.item !== null);
      
      // FILTREM PEL TIPUS EXACTE EN COMPTES DE PEL NOM!
      this.vacunasDisponibles = itemsLlenos.filter(slot => slot.item!.type === 'no apilable');
      this.xuxesDisponibles = itemsLlenos.filter(slot => slot.item!.type === 'apilable');
      
      this.cdr.detectChanges();
    });
  }

  logout() {
    this.authService.logout();
  }

  // ====== LÓGICA MODALES NIVEL 3 ======

  abrirModalAlimentar(xuxemon: any) {
    this.mensajeError = ''; this.mensajeExito = '';
    
    if (xuxemon.enfermedad === 'Atracón') {
       this.mensajeError = `El Xuxemon ${xuxemon.name} té un Atracón i no pot menjar!`;
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
    this.xuxemonSeleccionado = null;
  }

  // Cálculo Client-Side de evolución antes de enviar al backend
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

  getItemNombre(userItemId: number | null): string {
    if (!userItemId) return '';
    const slot = this.xuxesDisponibles.find(s => s.user_item_id === userItemId);
    return slot && slot.item ? slot.item.name : '';
  }

  alimentar() {
    if (!this.itemSeleccionadoId || this.cantidadAlimentar < 1) return;
    
    this.authService.feedXuxemon(this.xuxemonSeleccionado.id, this.itemSeleccionadoId, this.cantidadAlimentar).subscribe({
      next: (res) => {
        this.mensajeExito = res.message;
        this.loadMyXuxemons(); // Recargar los xuxemons
        this.inventoryService.cargarInventarioReal(); // Refrescar la mochila
        setTimeout(() => this.cerrarModales(), 2000);
      },
      error: (err) => this.mensajeError = err.error.message || 'Error a l\'alimentar'
    });
  }

  curar() {
    if (!this.itemSeleccionadoId) return;

    this.authService.healXuxemon(this.xuxemonSeleccionado.id, this.itemSeleccionadoId).subscribe({
      next: (res) => {
        this.mensajeExito = res.message;
        this.loadMyXuxemons(); 
        this.inventoryService.cargarInventarioReal(); 
        setTimeout(() => this.cerrarModales(), 2000);
      },
      error: (err) => this.mensajeError = err.error.message || 'Error al curar'
    });
  }
}
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { XuxemonsService, Xuxemon as BaseXuxemon } from '../../services/xuxemons.service'; 
import { Subscription } from 'rxjs';

// NUEVO: Extendemos la interfaz original para añadir la propiedad que nos envía Laravel
export interface Xuxemon extends BaseXuxemon {
  is_captured?: boolean;
}

@Component({
  selector: 'app-xuxedex',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './xuxedex.html',
  styleUrl: './xuxedex.css'
})
export class Xuxedex implements OnInit, OnDestroy {
  
  userName: string = '';
  rawXuxemons: Xuxemon[] = []; // Guarda los datos tal cual llegan de Laravel
  allXuxemons: Xuxemon[] = []; // Es lo que mostramos en el HTML (con la búsqueda por nombre aplicada)
  
  searchTerm: string = '';
  selectedType: string = 'todos';
  selectedSize: string = 'todas';
  
  loading: boolean = false;
  error: string = '';

  private authSub!: Subscription;
  private xuxeSub!: Subscription;

  constructor(
    private authService: Auth,
    private xuxemonsService: XuxemonsService,
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.authSub = this.authService.currentUser$.subscribe(user => {
      if (user && user.name) {
        this.userName = user.name;
      } else {
        this.userName = 'Entrenador';
      }
    });

    // Cargamos los Xuxemons al entrar
    this.loadXuxemonsFromBackend();
  }

  ngOnDestroy() {
    if (this.authSub) this.authSub.unsubscribe();
    if (this.xuxeSub) this.xuxeSub.unsubscribe();
  }

  // Llama al Backend enviando los parámetros seleccionados
  loadXuxemonsFromBackend() {
    this.loading = true;
    this.error = '';

    this.xuxeSub = this.authService.getAllXuxemons(this.selectedType, this.selectedSize).subscribe({
      next: (data: any) => {
        this.loading = false;
        // Asignamos los datos puros que vienen de Laravel
        this.rawXuxemons = Array.isArray(data) ? data : (data.data || Object.values(data));
        
        // Aplicamos la búsqueda por texto local
        this.applyLocalSearch();
      },
      error: (err: any) => { // <-- ARREGLADO: Añadido : any
        this.loading = false;
        this.error = 'No se pudieron cargar los Xuxemons desde el servidor.';
        console.error('Error cargando Xuxemons:', err);
      }
    });
  }

  // Filtra por nombre localmente para no saturar el servidor al teclear
  applyLocalSearch() {
    if (!this.searchTerm.trim()) {
      this.allXuxemons = [...this.rawXuxemons];
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      this.allXuxemons = this.rawXuxemons.filter(x => 
        x.name.toLowerCase().includes(searchLower)
      );
    }
    this.cdr.detectChanges(); 
  }

  filterByType(type: string) {
    this.selectedType = type;
    this.loadXuxemonsFromBackend(); // Exigencia de la rúbrica: filtrar desde BD
  }

  filterBySize(size: string) {
    this.selectedSize = size;
    this.loadXuxemonsFromBackend(); // Exigencia de la rúbrica: filtrar desde BD
  }

  evolveSize(xuxemon: Xuxemon, event: Event) {
    event.stopPropagation();
    if (xuxemon.size === 'Pequeño') {
      xuxemon.size = 'Mediano';
      xuxemon.attack += 20;
      xuxemon.defense += 15;
      xuxemon.level += 5;
    } else if (xuxemon.size === 'Mediano') {
      xuxemon.size = 'Grande';
      xuxemon.attack += 20;
      xuxemon.defense += 15;
      xuxemon.level += 5;
    } else {
      alert('¡Ya es tamaño Grande! No puede evolucionar más');
    }
  }

  getSizeText(size: string): string {
    return size;
  }

  getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      'Agua': '#2196F3',
      'Tierra': '#8B4513',
      'Aire': '#E0E0E0'
    };
    return colors[type] || '#9E9E9E';
  }

  getTypeGradient(type: string): string {
    const gradients: Record<string, string> = {
      'Agua': 'linear-gradient(135deg, #2196F3, #64B5F6)',
      'Tierra': 'linear-gradient(135deg, #8B4513, #A0522D)',
      'Aire': 'linear-gradient(135deg, #E0E0E0, #F5F5F5)'
    };
    return gradients[type] || 'linear-gradient(135deg, #9E9E9E, #BDBDBD)';
  }

  viewDetails(xuxemon: Xuxemon) {
    console.log('Ver detalles de:', xuxemon.name);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
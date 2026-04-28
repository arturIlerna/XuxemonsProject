import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Auth } from '../../services/auth';  // Asegúrate que la ruta sea correcta

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

  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarUserInfo();
    this.loadCatalogo();
    this.loadMyXuxemons();
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

  evolveSize(xuxemon: any, event: Event) {
    event.stopPropagation();
    
    if (xuxemon.size === 'Grande') {
      console.log('Ya está en tamaño máximo');
      alert('✨ Este Xuxemon ya está en su tamaño máximo');
      return;
    }
    
    this.authService.evolveXuxemon(xuxemon.id).subscribe({
      next: (res: any) => {
        console.log(res.message);
        alert(res.message);
        this.loadMyXuxemons();
      },
      error: (err: any) => {
        console.error('Error al evolucionar:', err);
        alert('❌ Error al evolucionar el Xuxemon');
      }
    });
  }
}
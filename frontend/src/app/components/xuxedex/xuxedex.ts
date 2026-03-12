import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';

interface Xuxemon {
  id: number; 
  name: string;
  type: 'Aigua' | 'Terra' | 'Aire'; 
  size: 'Petit' | 'Mitjà' | 'Gran'; 
  level: number;
  attack: number;
  defense: number;
  icon: string;
  captured: boolean;
}

@Component({
  selector: 'app-xuxedex',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './xuxedex.html',
  styleUrl: './xuxedex.css'
})
export class Xuxedex implements OnInit {
  
  userName: string = '';
  searchTerm: string = '';
  selectedType: string = 'todos';
  
  // Datos de ejemplo - Reemplazar con API real
  allXuxemons = [
    { id: 1, name: 'Floppi', type: 'tierra', level: 25, attack: 70, defense: 85, icon: '🪨', captured: true },
    { id: 2, name: 'Charmander', type: 'fuego', level: 18, attack: 85, defense: 60, icon: '🔥', captured: true },
    { id: 3, name: 'Squirtle', type: 'agua', level: 22, attack: 75, defense: 80, icon: '💧', captured: false },
    { id: 4, name: 'Bulbasaur', type: 'planta', level: 20, attack: 70, defense: 75, icon: '🌱', captured: true },
    { id: 5, name: 'Pikachu', type: 'electrico', level: 30, attack: 90, defense: 70, icon: '⚡', captured: false },
    { id: 6, name: 'Geodude', type: 'tierra', level: 15, attack: 65, defense: 90, icon: '🪨', captured: true },
    { id: 7, name: 'Vulpix', type: 'fuego', level: 12, attack: 70, defense: 65, icon: '🔥', captured: false },
    { id: 8, name: 'Psyduck', type: 'agua', level: 8, attack: 60, defense: 55, icon: '💧', captured: true },
  ];

  filteredXuxemons: any[] = [];

  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    this.userName = user?.name || 'Entrenador';
    this.filteredXuxemons = [...this.allXuxemons];
  }

  filterXuxemons() {
    this.filteredXuxemons = this.allXuxemons.filter(xuxemon => {
      const matchesSearch = xuxemon.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesType = this.selectedType === 'todos' || xuxemon.type === this.selectedType;
      return matchesSearch && matchesType;
    });
  }

  filterByType(type: string) {
    this.selectedType = type;
    this.filterXuxemons();
  }

  getTypeColor(type: string): string {
    const colors: any = {
      tierra: '#8B4513',
      fuego: '#FF5722',
      agua: '#2196F3',
      planta: '#4CAF50',
      electrico: '#FFC107'
    };
    return colors[type] || '#9E9E9E';
  }

  getTypeGradient(type: string): string {
    const gradients: any = {
      tierra: 'linear-gradient(135deg, #8B4513, #A0522D)',
      fuego: 'linear-gradient(135deg, #FF5722, #FF7043)',
      agua: 'linear-gradient(135deg, #2196F3, #42A5F5)',
      planta: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
      electrico: 'linear-gradient(135deg, #FFC107, #FFD54F)'
    };
    return gradients[type] || 'linear-gradient(135deg, #9E9E9E, #BDBDBD)';
  }

  viewDetails(xuxemon: any) {
    console.log('Ver detalles de:', xuxemon.name);
    // Aquí iría: this.router.navigate(['/xuxemon', xuxemon.id]);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
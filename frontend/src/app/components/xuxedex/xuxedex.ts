import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  captured: boolean;
}

@Component({
  selector: 'app-xuxedex',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './xuxedex.html',
  styleUrl: './xuxedex.css'
})
export class Xuxedex implements OnInit {
  
  userName: string = '';
  searchTerm: string = '';
  selectedType: string = 'tots';
  
  private xuxemonNames = ['Floppi', 'Charmander', 'Squirtle', 'Bulbasaur', 'Pikachu', 'Geodude', 'Vulpix', 'Psyduck'];

  allXuxemons: Xuxemon[] = [
    { id: 1, name: 'Floppi', type: 'Terra', size: 'Petit', level: 5, attack: 40, defense: 50, captured: true },
    { id: 2, name: 'Charmander', type: 'Aire', size: 'Mitjà', level: 18, attack: 70, defense: 45, captured: true },
    { id: 3, name: 'Squirtle', type: 'Aigua', size: 'Petit', level: 10, attack: 45, defense: 60, captured: false },
    { id: 4, name: 'Bulbasaur', type: 'Terra', size: 'Mitjà', level: 20, attack: 60, defense: 65, captured: true },
    { id: 5, name: 'Pikachu', type: 'Aire', size: 'Petit', level: 8, attack: 55, defense: 40, captured: false },
    { id: 6, name: 'Geodude', type: 'Terra', size: 'Petit', level: 15, attack: 50, defense: 75, captured: true },
    { id: 7, name: 'Charmander', type: 'Aire', size: 'Petit', level: 7, attack: 45, defense: 35, captured: true },
  ];

  filteredXuxemons: Xuxemon[] = [];

  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    this.userName = user?.name || 'Entrenador';
    this.filteredXuxemons = [...this.allXuxemons];
  }

  
  addRandomXuxemon() {
    const names = this.xuxemonNames;
    const types: ('Aigua' | 'Terra' | 'Aire')[] = ['Aigua', 'Terra', 'Aire'];
    const sizes: ('Petit' | 'Mitjà' | 'Gran')[] = ['Petit', 'Mitjà', 'Gran'];
    
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
    const randomLevel = Math.floor(Math.random() * 30) + 1;
    const randomAttack = Math.floor(Math.random() * 50) + 30;
    const randomDefense = Math.floor(Math.random() * 50) + 30;
    
    const newXuxemon: Xuxemon = {
      id: Date.now(),
      name: randomName,
      type: randomType,
      size: randomSize,
      level: randomLevel,
      attack: randomAttack,
      defense: randomDefense,
      captured: Math.random() > 0.3
    };
    
    this.allXuxemons.push(newXuxemon);
    this.filterXuxemons();
  }

  
  evolveSize(xuxemon: Xuxemon, event: Event) {
    event.stopPropagation();
    
    const sizeOrder: ('Petit' | 'Mitjà' | 'Gran')[] = ['Petit', 'Mitjà', 'Gran'];
    const currentIndex = sizeOrder.indexOf(xuxemon.size);
    
    if (currentIndex < sizeOrder.length - 1) {
      xuxemon.size = sizeOrder[currentIndex + 1];
      xuxemon.attack += 20;
      xuxemon.defense += 15;
      xuxemon.level += 5;
    } else {
      alert('¡Ya es tamaño Gran! No puede evolucionar más');
    }
  }

  filterXuxemons() {
    const searchLower = this.searchTerm.toLowerCase();
    
    this.filteredXuxemons = this.allXuxemons.filter(xuxemon => {
      const matchesSearch = xuxemon.name.toLowerCase().includes(searchLower);
      const matchesType = this.selectedType === 'tots' || xuxemon.type === this.selectedType;
      return matchesSearch && matchesType;
    });
  }

  filterByType(type: string) {
    this.selectedType = type;
    this.filterXuxemons();
  }

  getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      'Aigua': '#2196F3',
      'Terra': '#8B4513',
      'Aire': '#E0E0E0'
    };
    return colors[type] || '#9E9E9E';
  }

  getTypeGradient(type: string): string {
    const gradients: Record<string, string> = {
      'Aigua': 'linear-gradient(135deg, #2196F3, #64B5F6)',
      'Terra': 'linear-gradient(135deg, #8B4513, #A0522D)',
      'Aire': 'linear-gradient(135deg, #E0E0E0, #F5F5F5)'
    };
    return gradients[type] || 'linear-gradient(135deg, #9E9E9E, #BDBDBD)';
  }

  getSizeText(size: string): string {
    const sizeText = {
      'Petit': 'Pequeño',
      'Mitjà': 'Mediano',
      'Gran': 'Grande'
    };
    return sizeText[size as keyof typeof sizeText] || size;
  }

  viewDetails(xuxemon: Xuxemon) {
    console.log('Detalles de:', xuxemon.name);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
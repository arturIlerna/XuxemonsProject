import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-mis-xuxemons',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-xuxemons.html',
  styleUrl: './mis-xuxemons.css'
})
export class MisXuxemons implements OnInit {
  myCollection: any[] = [];
  loading: boolean = true;
  userName: string = '';

  constructor(
    private authService: Auth,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.userName = this.authService.getUser()?.name || 'Entrenador';
    this.loadMyXuxemons();
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

  logout() {
    this.authService.logout();
  }
}
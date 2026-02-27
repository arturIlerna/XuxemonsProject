import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router'; 
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  public userName: string = '';

  constructor(private authService: Auth, private router: Router) {}

  // Se ejecuta nada más cargar la página
  ngOnInit() {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      this.userName = user.name; // Cogemos nombre del usuario
    }
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']); // Patada de vuelta al login
  }
}
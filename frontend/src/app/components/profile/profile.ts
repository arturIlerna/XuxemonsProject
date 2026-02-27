import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink], 
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  public user: any = null;

  constructor(private authService: Auth, private router: Router) {}

  ngOnInit() {
    // Al cargar la página, cogemos los datos del usuario guardados
    const userString = localStorage.getItem('user');
    if (userString) {
      this.user = JSON.parse(userString);
    }
  }

  onDeleteAccount() {
    // 1. Confirmación
    const isConfirmed = confirm('⚠️ ¿Estás seguro de que quieres darte de baja? Perderás tu cuenta y todos tus Xuxemons para siempre.');

    // 2. Si se pulsa Aceptar, se borran los datos
    if (isConfirmed && this.user) {
      this.authService.deleteAccount(this.user.id).subscribe({
        next: (res) => {
          alert('Cuenta eliminada correctamente.');
          // Limpiamos los datos y lo mandamos al login
          this.authService.logout();
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Error al dar de baja:', err);
          alert('Hubo un problema al eliminar la cuenta. Inténtalo de nuevo más tarde.');
        }
      });
    }
  }
}
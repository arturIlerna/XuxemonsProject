import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router'; 
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink], 
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  constructor(private authService: Auth, private router: Router) {}

  onRegister(event: any) {
    event.preventDefault();
    
    const name = event.target.name.value;
    const lastname = event.target.lastname.value;
    const email = event.target.email.value;
    const password = event.target.password.value;
    const password_confirmation = event.target.password_confirmation.value;

    // Validación de seguridad del pswd
    if (password !== password_confirmation) {
      alert('⚠️ Las contraseñas no coinciden');
      return;
    }

    this.authService.register({ name, lastname, email, password, password_confirmation }).subscribe({
      next: (res) => {
        console.log('Registro exitoso para:', res.user?.name);
        
        // En el auth.ts ya guardamos el token al registrar, vamos directos al dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Error en el registro:', err);
        alert('Fallo en el registro. Comprueba la consola.');
      }
    });
  }
}
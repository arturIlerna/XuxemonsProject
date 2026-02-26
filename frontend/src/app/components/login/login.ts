import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router'; 
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  public token = signal<string | null>(null);

  constructor(private authService: Auth, private router: Router) {}

  onLogin(event: any) {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;

    this.authService.login({ email, password }).subscribe({
      next: (res) => {
        this.token.set(res.access_token);
        console.log('Login exitoso para:', res.user.name);
        
        // Nos pasamos al Dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Error:', err);
        alert('Fallo en el login');
      }
    });
  }
}

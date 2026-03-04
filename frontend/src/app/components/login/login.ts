import { Component, signal, OnInit } from '@angular/core'; 
import { Router, RouterLink } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  
  // Nuestro interruptor para el token
  public token = signal<string | null>(null); 

  loginForm!: FormGroup;
  isLoading: boolean = false;
  loginError: boolean = false;

  constructor(
    private authService: Auth, 
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.loginError = false;

      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          this.token.set(res.access_token); // Aquí guardamos el token
          console.log('Login exitoso para:', res.user?.name);
          
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Error:', err);
          this.loginError = true;
          this.isLoading = false;
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
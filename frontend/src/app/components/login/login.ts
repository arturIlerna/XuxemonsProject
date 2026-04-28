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
  
  public token = signal<string | null>(null); 
  public mensajeRecompensa: string = '';

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
      xuxe_id: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.loginError = false;
      this.mensajeRecompensa = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          this.token.set(res.access_token);
          console.log('Login exitoso para:', res.user?.name);
          
          // Verificar recompensas diarias después del login
          this.verificarRecompensasDiarias(res.user);
          
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

  // Verificar si debe entregar recompensas
  verificarRecompensasDiarias(user: any) {
    const hoy = new Date().toISOString().split('T')[0];
    const horaActual = new Date().getHours();
    const minutosActual = new Date().getMinutes();
    const horaActualStr = `${horaActual.toString().padStart(2, '0')}:${minutosActual.toString().padStart(2, '0')}`;
    
    const ultimaRecompensaFecha = localStorage.getItem(`recompensa_${user.id}_fecha`);
    
    // Si ya recibió hoy, no hacer nada
    if (ultimaRecompensaFecha === hoy) {
      console.log('✅ Ya recibiste las recompensas de hoy');
      return;
    }
    
    // Verificar si ya son las 8:00 AM o más
    if (horaActualStr < '08:00') {
      console.log('⏰ Aún no son las 8:00 AM. Las recompensas se entregarán después de las 8:00');
      return;
    }
    
    // Entregar recompensas
    this.entregarRecompensas(user, hoy);
  }

  // Entregar recompensas al usuario
  entregarRecompensas(user: any, fecha: string) {
    // 1. Entregar 10 Xuxes
    this.authService.giveXuxes(user.id, 'Xuxe', 10).subscribe({
      next: () => {
        console.log('✅ 10 Xuxes entregados a', user.name);
      },
      error: (err) => {
        console.error('❌ Error entregando Xuxes:', err);
      }
    });
    
    // 2. Entregar Xuxemon aleatorio
    this.authService.giveRandomXuxemon(user.id).subscribe({
      next: (res: any) => {
        console.log(`✅ Xuxemon entregado a ${user.name}: ${res.xuxemon}`);
        localStorage.setItem(`recompensa_${user.id}_fecha`, fecha);
        localStorage.setItem(`recompensa_${user.id}_xuxemon`, res.xuxemon);
        this.mensajeRecompensa = `🎁 Has recibido 10 Xuxes y un Xuxemon: ${res.xuxemon}!`;
        
        // Opcional: limpiar mensaje después de 5 segundos
        setTimeout(() => {
          this.mensajeRecompensa = '';
        }, 5000);
      },
      error: (err) => {
        console.error('❌ Error entregando Xuxemon:', err);
      }
    });
  }
}
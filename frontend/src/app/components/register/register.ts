import { Component, signal, OnInit } from '@angular/core'; // <-- Añadido 'signal'
import { Router, RouterLink } from '@angular/router'; 
import { CommonModule } from '@angular/common'; 
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms'; 
import { Auth } from '../../services/auth'; 

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule], 
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit {
  
  registerForm!: FormGroup;
  isLoading: boolean = false; 

  // Variables reactivas (signals) para controlar el aviso final
  public registeredId = signal<string | null>(null);
  public showAviso = signal<boolean>(false);

  constructor(
    private fb: FormBuilder, 
    private authService: Auth, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      lastname: ['', [Validators.required, Validators.minLength(3)]], 
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6),
        Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,}$') 
      ]],
      password_confirmation: ['', [Validators.required]]
    }, { 
      validators: this.passwordsMatchValidator 
    });
  }

  passwordsMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('password_confirmation')?.value;
    
    if (!password || !confirmPassword) return null;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onRegister() {
    if (this.registerForm.valid) {
      this.isLoading = true; 
      
      // Enviamos el formulario limpio. Laravel se encarga de crear el #NomXXXX
      this.authService.register(this.registerForm.value).subscribe({
        next: (res) => {
          this.isLoading = false; 
          
          // 1. Guardamos el ID que nos devuelve Laravel
          this.registeredId.set(res.user.xuxe_id); 
          
          // 2. Mostramos el modal de aviso (no redirigimos todavía)
          this.showAviso.set(true); 
        },
        error: (err) => {
          console.error('Error en el registro:', err);
          alert('Fallo en el registro. Es posible que el email ya exista.');
          this.isLoading = false; 
        }
      });

    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  // Función para el botón de copiar
  copyId() {
    const id = this.registeredId();
    if (id) {
      navigator.clipboard.writeText(id);
      alert('¡ID copiado al portapapeles!');
    }
  }

  // Función para ir al dashboard una vez guardado el ID
  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
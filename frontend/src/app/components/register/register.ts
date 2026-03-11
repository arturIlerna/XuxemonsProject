import { Component, OnInit } from '@angular/core';
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
  isLoading: boolean = false; // interruptor de carga

  // Añadimos FormBuilder junto a los serivces
  constructor(
    private fb: FormBuilder, 
    private authService: Auth, 
    private router: Router
  ) {}

  ngOnInit(): void {
    // Definimos las reglas para TODOS los campos
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

  // Comprobación de que las contraseñas son iguales
  passwordsMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('password_confirmation')?.value;
    
    if (!password || !confirmPassword) return null;
    return password === confirmPassword ? null : { mismatch: true };
  }

  // Angular controla los datos
  onRegister() {
    if (this.registerForm.valid) {

      this.isLoading = true; // ENCENDEMOS LA ANIMACIÓN
      
      // Le pasamos a tu servicio TODOS los datos del formulario de golpe
      this.authService.register(this.registerForm.value).subscribe({
        next: (res) => {
          console.log('Registro exitoso para:', res?.user?.name || 'usuario');
          this.isLoading = false; // APAGAMOS (aunque cambie de página)
          // Vamos directos al dashboard 
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Error en el registro:', err);
          alert('Fallo en el registro. Comprueba la consola.');
          this.isLoading = false; // APAGAMOS SI HAY ERROR para que se pueda volver a intentar
        }
      });

    } else {
      // Si hay fallos de validación, forzamos a que salgan las alertas rojas en el HTML
      this.registerForm.markAllAsTouched();
    }
  }
}
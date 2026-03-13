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
      
      // 1. Generamos un número aleatorio entre 0 y 9999, forzando que siempre tenga 4 cifras 
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      
      // 2. Hacemos una copia de los datos del formulario para poder modificarlos
      const finalData = { ...this.registerForm.value };
      
      // 3. Le pegamos el ID visual al nombre (ej: "Artur" pasa a ser "Artur#7421")
      finalData.name = `${finalData.name}#${randomNum}`;
      
      // Le pasamos al servicio los datos YA MODIFICADOS con el ID
      this.authService.register(finalData).subscribe({
        next: (res) => {
          // Mostramos una alerta bonita para que el usuario sepa cuál es su nuevo ID
          alert(`¡Registro completado! Tu ID de entrenador es: ${finalData.name}`);
          
          this.isLoading = false; 
          // Vamos directos al login 
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Error en el registro:', err);
          alert('Fallo en el registro. Comprueba la consola.');
          this.isLoading = false; 
        }
      });

    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
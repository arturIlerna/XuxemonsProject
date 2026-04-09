import { Component, OnInit, signal } from '@angular/core'; // <-- Importamos signal
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule], 
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  public user: any = null;
  public profileForm!: FormGroup; 

  // 1. Señal para controlar la visibilidad del modal
  public showDeleteModal = signal<boolean>(false);

  constructor(
    private authService: Auth, 
    private router: Router,
    private fb: FormBuilder 
  ) {}

  ngOnInit() {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]], 
      password: ['', [Validators.minLength(6)]] 
    });

    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user = user;
        this.profileForm.patchValue({
          name: this.user.name,
          lastname: this.user.lastname || '', 
          email: this.user.email
        });
      }
    });
  }

  onUpdateProfile() {
    if (this.profileForm.invalid) {
      alert('⚠️ Por favor, corrige los errores en rojo antes de guardar.');
      return;
    }

    const updatedData = this.profileForm.value;

    this.authService.updateProfile(this.user.id, updatedData).subscribe({
      next: (res) => {
        alert('¡Perfil actualizado con éxito! 🎉');
        this.user = res.user;
        localStorage.setItem('user', JSON.stringify(res.user));
        this.profileForm.get('password')?.reset('');
      },
      error: (err) => {
        console.error('Error al actualizar el perfil:', err);
        alert('Hubo un problema al guardar los cambios. Revisa la consola.');
      }
    });
  }

  // --- NUEVAS FUNCIONES PARA EL MODAL DE BORRADO ---

  // 2. Abre el modal
  triggerDelete() {
    this.showDeleteModal.set(true);
  }

  // 3. Cierra el modal si el usuario se arrepiente
  cancelDelete() {
    this.showDeleteModal.set(false);
  }

  // 4. Ejecuta el borrado real si el usuario confirma
  confirmDelete() {
    if (this.user) {
      this.authService.deleteAccount(this.user.id).subscribe({
        next: (res) => {
          alert('Cuenta eliminada correctamente. ¡Una pena verte partir!');
          this.authService.logout();
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Error al dar de baja:', err);
          alert('Hubo un problema al eliminar la cuenta. Inténtalo de nuevo más tarde.');
          this.showDeleteModal.set(false); // Escondemos el modal si hay error
        }
      });
    }
  }
}
import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { authGuard } from './guards/auth.guard'; // <-- Importamos al portero

export const routes: Routes = [
  { path: 'login', component: Login },
  { 
    path: 'dashboard', 
    component: Dashboard, 
    canActivate: [authGuard] // Ruta protegida
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
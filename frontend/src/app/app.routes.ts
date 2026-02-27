import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { Register } from './components/register/register';
import { authGuard } from './guards/auth.guard'; // Import del guard

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { 
    path: 'dashboard', 
    component: Dashboard, 
    canActivate: [authGuard] // Ruta protegida
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { Register } from './components/register/register';
import { Profile } from './components/profile/profile';
import { Xuxedex } from './components/xuxedex/xuxedex'; 
import { authGuard } from './guards/auth.guard';
import { Mochila } from './components/mochila/mochila';
import { Admin } from './components/admin/admin';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    component: Login,
    title: 'Inicia sessió - Xuxedex' 
  },
  { 
    path: 'register', 
    component: Register,
    title: 'Registre - Xuxedex' 
  },
  { 
    path: 'dashboard', 
    component: Dashboard, 
    canActivate: [authGuard],
    title: 'Taulell - Xuxedex'
  },
  { 
    path: 'profile',
    component: Profile, 
    canActivate: [authGuard],
    title: 'El meu Perfil - Xuxedex' 
  },
  { 
    path: 'xuxedex',                    
    component: Xuxedex,
    canActivate: [authGuard],
    title: 'Catàleg Xuxedex - Xuxedex'           
  },
  { 
    path: 'inventory', 
    component: Mochila,
    canActivate: [authGuard], // Añadido el guard para proteger el inventario
    title: 'La meva Motxilla - Xuxedex' 
  },
  { 
    path: 'admin', 
    component: Admin, 
    canActivate: [adminGuard],
    title: 'Administració - Xuxedex' 
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
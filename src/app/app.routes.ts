import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth.guard';

export const routes: Routes = [
  // Home redirect
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // Authentication
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent), data: { title: 'Login' } },

  // Protected admin/employee area
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'EMPLEADO'], title: 'Dashboard' },
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },

  {
    path: 'clientes',
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'EMPLEADO'], title: 'Clientes' },
    loadComponent: () => import('./components/clientes/clientes.component').then(m => m.ClientesComponent)
  },

  {
    path: 'menus',
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'EMPLEADO'], title: 'Menús' },
    loadComponent: () => import('./components/menus/menus.component').then(m => m.MenusComponent)
  },

  {
    path: 'mesas',
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'EMPLEADO'], title: 'Mesas' },
    loadComponent: () => import('./components/mesas/mesas.component').then(m => m.MesasComponent)
  },

  {
    path: 'reservaciones',
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'EMPLEADO'], title: 'Reservaciones' },
    loadComponent: () => import('./components/reservaciones/reservaciones.component').then(m => m.ReservacionesComponent)
  },

  {
    path: 'forbidden',
    loadComponent: () => import('./components/forbidden/forbidden.component').then(m => m.ForbiddenComponent),
    data: { title: 'Acceso denegado' }
  },

  {
    path: 'usuarios',
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'], title: 'Usuarios' },
    loadComponent: () => import('./components/usuarios/usuarios.component').then(m => m.UsuariosComponent)
  },

  // Demo (public)
  {
    path: 'demo-mesas',
    loadComponent: () => import('./demo/mesas-demo.component').then(m => m.MesasDemoComponent), data: { title: 'Demo Mesas' }
  },

  // Wildcard - redirect to dashboard (or login will handle unauthenticated access)
  { path: '**', redirectTo: '' }
];

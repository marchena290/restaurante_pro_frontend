import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

export interface MenuItem {
  label: string;
  route: string;
  icon?: string;
  roles?: string[]; // optional allowed roles
}

@Injectable({ providedIn: 'root' })
export class AuthorizationService {
  private allMenu: MenuItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: '🏠', roles: ['ADMIN', 'EMPLEADO'] },
    { label: 'Clientes', route: '/clientes', icon: '👥', roles: ['ADMIN', 'EMPLEADO'] },
    { label: 'Mesas', route: '/mesas', icon: '🪑', roles: ['ADMIN', 'EMPLEADO'] },
    { label: 'Menús', route: '/menus', icon: '🍽️', roles: ['ADMIN', 'EMPLEADO'] },
    { label: 'Reservaciones', route: '/reservaciones', icon: '📅', roles: ['ADMIN', 'EMPLEADO'] },
    { label: 'Usuarios', route: '/usuarios', icon: '👤', roles: ['ADMIN'] }
  ];

  constructor(private auth: AuthService) {}

  getAuthorizedMenuItems(): MenuItem[] {
    const roles = this.auth.getUserRoles().map(r => r.toUpperCase());
    // If no roles (not logged or token lacks roles), return a minimal public menu
    if (!roles.length) return [ { label: 'Demo Mesas', route: '/demo-mesas', icon: '🪑' } ];

    return this.allMenu.filter(item => {
      if (!item.roles || !item.roles.length) return true;
      return item.roles.some(role => roles.includes(role.toUpperCase()));
    });
  }
}

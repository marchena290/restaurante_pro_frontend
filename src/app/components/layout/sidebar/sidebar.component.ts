import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AuthorizationService } from '../../../services/authorization.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sidebar" [class.collapsed]="collapsed">
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon">🍽️</span>
          <span class="logo-text" *ngIf="!collapsed">RestaurantePro</span>
        </div>
        <button class="toggle-btn" (click)="toggleSidebar()">
          <span [innerHTML]="collapsed ? '➡️' : '⬅️'"></span>
        </button>
      </div>

      <nav class="sidebar-nav">
        <a
          *ngFor="let item of menuItems"
          [routerLink]="item.route"
          routerLinkActive="active"
          class="nav-item"
          [title]="collapsed ? item.label : ''"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label" *ngIf="!collapsed">{{ item.label }}</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info" *ngIf="currentUser">
          <div class="user-avatar">{{ currentUser.name?.charAt(0) }}</div>
          <div class="user-details" *ngIf="!collapsed">
            <div class="user-name">{{ currentUser.name }}</div>
            <div class="user-role">{{ currentUser.role }}</div>
          </div>
        </div>
        <button class="logout-btn" (click)="logout()" [title]="collapsed ? 'Cerrar Sesión' : ''">
          <span class="logout-icon">🚪</span>
          <span class="logout-text" *ngIf="!collapsed">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      background: #1f2937;
      color: white;
      height: 100vh;
      width: var(--sidebar-width);
      transition: width 0.28s cubic-bezier(.2,.9,.2,1), box-shadow 0.2s ease;
      will-change: width, transform;
      overflow: hidden; /* avoid content spilling during collapse */
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 1000;
    }

    .sidebar.collapsed {
      width: var(--sidebar-collapsed-width);
    }

    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid #374151;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      font-size: 1.5rem;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 700;
    }

    /* Hide text labels smoothly when collapsed instead of allowing layout reflow */
    .logo-text, .nav-label, .user-details, .logout-text {
      transition: opacity 0.18s ease, transform 0.18s ease;
      transform-origin: left center;
      will-change: opacity, transform;
      backface-visibility: hidden;
    }

    .sidebar.collapsed .logo-text,
    .sidebar.collapsed .nav-label,
    .sidebar.collapsed .user-details,
    .sidebar.collapsed .logout-text {
      opacity: 0;
      transform: translateX(-4px);
      pointer-events: none;
    }

    .toggle-btn {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: background 0.2s ease;
    }

    .toggle-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .sidebar-nav {
      flex: 1;
      padding: 20px 0;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      color: #d1d5db;
      text-decoration: none;
      transition: all 0.2s ease;
      border-left: 3px solid transparent;
    }

    .nav-icon, .nav-label { -webkit-font-smoothing: antialiased; }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .nav-item.active {
      background: rgba(59, 130, 246, 0.1);
      color: #60a5fa;
      border-left-color: #60a5fa;
    }

    .nav-icon {
      font-size: 1.25rem;
      min-width: 28px; /* give icons a bit more room */
    }

    .nav-label {
      font-weight: 500;
    }

    .sidebar-footer {
      padding: 20px;
      border-top: 1px solid #374151;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #3b82f6;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.125rem;
    }

    .user-details {
      min-width: 0;
      flex: 1;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.875rem;
      line-height: 1.2;
    }

    .user-role {
      font-size: 0.75rem;
      color: #9ca3af;
      line-height: 1.2;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 8px 12px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #fca5a5;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .logout-btn:hover {
      background: rgba(239, 68, 68, 0.2);
    }

    .logout-icon {
      font-size: 1.125rem;
    }

    .logout-text {
      font-size: 0.875rem;
      font-weight: 500;
    }

    .sidebar.collapsed .user-info {
      justify-content: center;
    }

    .sidebar.collapsed .logout-btn {
      justify-content: center;
    }

    .sidebar.collapsed .nav-item {
      justify-content: center;
    }

    /* Ensure main content shift is smooth */
    :host ::ng-deep .main-area {
      transition: margin-left 0.28s cubic-bezier(.2,.9,.2,1);
      will-change: margin-left;
    }
  `]
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  currentUser: any = null;
  menuItems: any[] = [];
  private _sub: any = null;

  constructor(
    private authService: AuthService,
    private authorizationService: AuthorizationService,
    private router: Router
  ) {}

  ngOnInit() {
    // initialize UI based on current auth state
    this.currentUser = this.authService.getCurrentUser();
    this.menuItems = this.authorizationService.getAuthorizedMenuItems();

    // subscribe to auth changes so UI updates immediately on login/logout
    this._sub = this.authService.authState$.subscribe(() => {
      this.currentUser = this.authService.getCurrentUser();
      this.menuItems = this.authorizationService.getAuthorizedMenuItems();
    });
  }

  toggleSidebar() {
    this.toggleCollapse.emit();
  }

  logout() {
    this.authService.logout();
    // Ensure the app returns to the login screen after logout
    try {
      // navigate away from any public/demo routes
      (window as any).location && (window as any).location.pathname && null;
    } catch {}
    // Navigate within the SPA to login
    try {
      this.router.navigate(['/login']);
      return;
    } catch {
      // Fallback to full reload
      window.location.href = '/login';
    }
  }


  ngOnDestroy() {
    if (this._sub && typeof this._sub.unsubscribe === 'function') {
      this._sub.unsubscribe();
    }
  }
}

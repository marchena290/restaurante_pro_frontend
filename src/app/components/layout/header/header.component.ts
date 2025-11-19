import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <button class="mobile-menu-btn" (click)="toggleMobileMenu()">
        <span class="hamburger-icon">☰</span>
      </button>

      <div class="header-content">
        <h1 class="page-title">{{ pageTitle }}</h1>
        <div class="header-actions">
          <span class="current-time">{{ currentTime | date:'short' }}</span>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: white;
      border-bottom: 1px solid #e5e7eb;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .mobile-menu-btn {
      display: none;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 8px;
      border-radius: 6px;
      transition: background 0.2s ease;
    }

    .mobile-menu-btn:hover {
      background: #f3f4f6;
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .page-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .current-time {
      font-size: 0.875rem;
      color: #6b7280;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .mobile-menu-btn {
        display: block;
      }

      .page-title {
        font-size: 1.25rem;
      }
    }
  `]
})
export class HeaderComponent {
  @Input() pageTitle = 'Dashboard';
  @Output() toggleMobile = new EventEmitter<void>();

  currentTime = new Date();

  constructor() {
    // Update time every minute
    setInterval(() => {
      this.currentTime = new Date();
    }, 60000);
  }

  toggleMobileMenu() {
    this.toggleMobile.emit();
  }
}

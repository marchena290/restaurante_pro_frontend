import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="forbidden-page">
      <div class="forbidden-card">
        <div class="forbidden-icon">🚫</div>
        <h1>403</h1>
        <h2>Acceso denegado</h2>
        <p>No tienes permiso para ver esta página.</p>
        <div class="forbidden-actions">
          <a routerLink="/" class="btn btn-secondary">Volver al inicio</a>
          <a routerLink="/login" class="btn btn-primary">Iniciar sesión</a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .forbidden-page { display:flex; align-items:center; justify-content:center; min-height:100vh; background:#f8fafc; padding:20px; }
    .forbidden-card { text-align:center; background:var(--white); padding:36px; border-radius:12px; box-shadow: 0 10px 30px rgba(2,6,23,0.08); max-width:520px; width:100%; }
    .forbidden-icon { font-size:2.5rem; margin-bottom:8px; }
    h1 { font-size:3rem; margin:8px 0; }
    h2 { font-size:1.25rem; margin:8px 0 12px 0; color:var(--neutral-900); }
    p { color:var(--neutral-600); margin-bottom:20px; }
    .forbidden-actions { display:flex; gap:12px; justify-content:center; }
    .btn { padding:10px 14px; border-radius:8px; text-decoration:none; display:inline-flex; align-items:center; gap:8px; }
    .btn-primary { background:var(--color-primary); color:white; }
    .btn-secondary { background:#f3f4f6; color:var(--neutral-900); }
    `
  ]
})
export class ForbiddenComponent {}

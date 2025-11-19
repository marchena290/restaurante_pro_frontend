import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>🍽️ RestaurantePro</h1>
          <p>Sistema de Reservaciones</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="form-control"
              [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
              placeholder="usuario@ejemplo.com"
            >
            <div class="error-message" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              Email es requerido
            </div>
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              class="form-control"
              [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
              placeholder="••••••••"
            >
            <div class="error-message" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              Contraseña es requerida
            </div>
          </div>

          <div class="error-message" *ngIf="error">
            {{ error }}
          </div>

          <button
            type="submit"
            class="btn-primary"
            [disabled]="loginForm.invalid || loading"
          >
            <span *ngIf="loading">Iniciando sesión...</span>
            <span *ngIf="!loading">Iniciar Sesión</span>
          </button>
        </form>

        <div class="demo-credentials">
          <h3>Credenciales de Prueba:</h3>
          <div class="credential-item">
            <strong>Admin:</strong> admin&#64;restaurant.com / admin123
          </div>
          <div class="credential-item">
            <strong>Empleado:</strong> empleado&#64;restaurant.com / empleado123
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      /* keep container transparent so the global main.login-page gradient shows */
      background: transparent;
      padding: 20px;
    }

    .login-card {
      background: var(--white);
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(2,6,23,0.12);
      width: 100%;
      max-width: 400px;
      position: relative;
      z-index: 2; /* ensure card sits above any background layers */
    }

    .login-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .login-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 8px 0;
    }

    .login-header p {
      color: #6b7280;
      margin: 0;
      font-size: 1rem;
    }

    .login-form {
      margin-bottom: 30px;
    }

    .form-group {
      margin-bottom: 24px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #374151;
      font-weight: 500;
      font-size: 0.875rem;
    }

    .form-control {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .form-control.error {
      border-color: #dc2626;
    }

    .error-message {
      color: #dc2626;
      font-size: 0.875rem;
      margin-top: 8px;
    }

    .btn-primary {
      width: 100%;
      padding: 14px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary:hover:not(:disabled) {
      background: #1d4ed8;
      transform: translateY(-1px);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .demo-credentials {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .demo-credentials h3 {
      margin: 0 0 16px 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: #475569;
    }

    .credential-item {
      margin-bottom: 8px;
      font-size: 0.875rem;
      color: #64748b;
      font-family: 'Courier New', monospace;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Accept either email or username in the same field; backend expects `username`.
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loading = false;
          this.error = error.message || 'Error al iniciar sesión';
        }
      });
    }
  }
}

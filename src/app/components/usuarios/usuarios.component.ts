import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../models/user.model';
import { UsuariosService, UsuarioDto } from '../../services/usuarios.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="usuarios">
      <div class="page-header">
        <h2>Gestión de Usuarios</h2>
        <button class="btn btn-primary" (click)="openModal()">
          <span class="btn-icon">➕</span>
          Nuevo Usuario
        </button>
      </div>

      <div class="filters-section">
        <div class="filter-group">
          <label>Buscar:</label>
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (ngModelChange)="filterUsers()"
            placeholder="Buscar por nombre o email..."
            class="search-input"
          >
        </div>
        <div class="filter-group">
          <label>Rol:</label>
          <select [(ngModel)]="selectedRole" (ngModelChange)="filterUsers()" class="filter-select">
            <option value="">Todos</option>
            <option value="Admin">Admin</option>
            <option value="Empleado">Empleado</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Estado:</label>
          <select [(ngModel)]="selectedActive" (ngModelChange)="filterUsers()" class="filter-select">
            <option value="">Todos</option>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of filteredUsers">
              <td>
                <div class="user-info">
                  <div class="user-avatar">{{ user.name.charAt(0) }}</div>
                  <span class="user-name">{{ user.name }}</span>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <span class="role-badge" [class]="'role-' + user.role.toLowerCase()">
                  {{ user.role }}
                </span>
              </td>
              <td>
                <span class="status-badge" [class]="user.active ? 'status-active' : 'status-inactive'">
                  {{ user.active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>{{ user.createdAt ? formatDate(user.createdAt) : '-' }}</td>
              <td>
                <div class="action-buttons">
                  <button
                    class="btn-action btn-edit"
                    (click)="editUser(user)"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    class="btn-action"
                    [class]="user.active ? 'btn-deactivate' : 'btn-activate'"
                    (click)="toggleUserStatus(user)"
                    [title]="user.active ? 'Desactivar' : 'Activar'"
                  >
                    {{ user.active ? '🚫' : '✅' }}
                  </button>
                  <button
                    class="btn-action btn-delete"
                    (click)="deleteUser(user.id)"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingUser ? 'Editar' : 'Nuevo' }} Usuario</h3>
            <button class="modal-close" (click)="closeModal()">✕</button>
          </div>

          <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="modal-form">
            <div class="form-group">
              <label>Nombre Completo *</label>
              <input
                type="text"
                formControlName="name"
                class="form-control"
                placeholder="Ej: María González Pérez"
              >
              <div class="error-message" *ngIf="userForm.get('name')?.invalid && userForm.get('name')?.touched">
                Nombre es requerido
              </div>
            </div>

            <div class="form-group">
              <label>Email *</label>
              <input
                type="email"
                formControlName="email"
                class="form-control"
                placeholder="usuario@restaurant.com"
              >
              <div class="error-message" *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched">
                <span *ngIf="userForm.get('email')?.errors?.['required']">Email es requerido</span>
                <span *ngIf="userForm.get('email')?.errors?.['email']">Email no es válido</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Contraseña {{ editingUser ? '' : '*' }}</label>
                <input
                  type="password"
                  formControlName="password"
                  class="form-control"
                  [placeholder]="editingUser ? 'Dejar vacío para mantener actual' : 'Contraseña segura'"
                >
                <div class="error-message" *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched">
                  <span *ngIf="userForm.get('password')?.errors?.['required']">Contraseña es requerida</span>
                  <span *ngIf="userForm.get('password')?.errors?.['minlength']">Mínimo 6 caracteres</span>
                </div>
              </div>

              <div class="form-group">
                <label>Rol *</label>
                <select formControlName="role" class="form-control">
                  <option value="">Seleccionar rol</option>
                  <option value="Admin">Administrador</option>
                  <option value="Empleado">Empleado</option>
                </select>
                <div class="error-message" *ngIf="userForm.get('role')?.invalid && userForm.get('role')?.touched">
                  Rol es requerido
                </div>
              </div>
            </div>

            <div class="form-group" *ngIf="editingUser">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  formControlName="active"
                  class="checkbox-input"
                >
                <span class="checkbox-custom"></span>
                Usuario activo
              </label>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">
                Cancelar
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="userForm.invalid"
              >
                {{ editingUser ? 'Actualizar' : 'Crear' }} Usuario
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [/* styles kept in global stylesheet; component uses existing app styles */]
})
export class UsuariosComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = false;
  errorMessage = '';
  searchTerm = '';
  selectedRole = '';
  selectedActive = '';
  showModal = false;
  editingUser: User | null = null;

  userForm: FormGroup;

  constructor(private fb: FormBuilder, private usuariosService: UsuariosService) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      role: ['', Validators.required],
      active: [true]
    });
  }

  ngOnInit() {
    this.loading = true;
    this.errorMessage = '';
    this.usuariosService.list().subscribe({
      next: (users: UsuarioDto[]) => {
        // Map backend DTO to local User model shape
        this.users = users.map(u => ({
          id: String(u.id),
          name: u.nombre ?? u.username,
          email: u.email ?? '',
          role: (u.role ?? 'Empleado'),
          active: true,
          createdAt: new Date()
        } as User));
        this.filterUsers();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando usuarios desde backend', err);
        this.errorMessage = 'No se pudieron cargar los usuarios. Intenta nuevamente.';
        this.loading = false;
      }
    });
  }



  filterUsers() {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm ||
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesRole = !this.selectedRole || user.role === this.selectedRole;
      const matchesActive = this.selectedActive === '' || user.active.toString() === this.selectedActive;

      return matchesSearch && matchesRole && matchesActive;
    });
  }

  openModal() {
    this.showModal = true;
    this.editingUser = null;
    this.userForm.reset({ active: true });

    // Make password required for new users
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  closeModal() {
    this.showModal = false;
    this.editingUser = null;
  }

  editUser(user: User) {
    this.editingUser = user;
    this.showModal = true;

    // Make password optional for existing users
    this.userForm.get('password')?.setValidators([Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();

    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      active: user.active
    });
  }

  deleteUser(id: string) {
    if (confirm('¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      this.users = this.users.filter(u => u.id !== id);
      this.filterUsers();
    }
  }

  toggleUserStatus(user: User) {
    const index = this.users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      this.users[index].active = !this.users[index].active;
      this.filterUsers();
    }
  }

  onSubmit() {
    if (this.userForm.valid) {
      const formData = this.userForm.value;

      if (this.editingUser) {
        // Update existing user
        const index = this.users.findIndex(u => u.id === this.editingUser!.id);
        this.users[index] = {
          ...this.editingUser,
          name: formData.name,
          email: formData.email,
          role: formData.role,
          active: formData.active
        };

        // Only update password if provided
        if (formData.password) {
          this.users[index].password = formData.password;
        }
      } else {
        // Create new user
        const newUser: User = {
          id: Date.now().toString(),
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          active: formData.active,
          createdAt: new Date()
        };
        this.users.push(newUser);
      }

      this.filterUsers();
      this.closeModal();
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES');
  }
}

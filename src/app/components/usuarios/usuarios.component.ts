import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../models/user.model';
import { UsuariosService, UsuarioDto } from '../../services/usuarios.service';
import { ConfirmService } from '../../services/confirm.service';
import { NotificationService } from '../../services/notification.service';

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
                    type="button"
                    class="btn-action btn-edit"
                    (click)="editUser(user)"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    class="btn-action"
                    [class]="user.active ? 'btn-deactivate' : 'btn-activate'"
                    (click)="toggleUserStatus(user)"
                    [title]="user.active ? 'Desactivar' : 'Activar'"
                  >
                    {{ user.active ? '🚫' : '✅' }}
                  </button>
                  <button
                    type="button"
                    class="btn-action btn-delete"
                    (click)="onDeleteClicked(user.id)"
                    [disabled]="submitting"
                    title="Eliminar"
                  >
                    <span *ngIf="!submitting">🗑️</span>
                    <span *ngIf="submitting">⏳</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal -->
       <div class="modal-overlay usuarios-modal-overlay" *ngIf="showModal" (click)="closeModal()"
         style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);z-index:9999;">
         <div class="modal-content usuarios-modal-content" (click)="$event.stopPropagation()"
           style="width:560px;max-width:100%;padding:18px 20px;border-radius:10px;box-shadow:0 18px 40px rgba(0,0,0,0.18);background:#fff;color:#222;">
          <div class="modal-header usuarios-modal-header">
            <h3>{{ editingUser ? 'Editar' : 'Nuevo' }} Usuario</h3>
            <button class="modal-close" (click)="closeModal()">✕</button>
          </div>

          <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="modal-form usuarios-modal-form">
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

                <!-- confirmation handled via ConfirmService -->
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
  styles: [
    `
    /* Modal overlay and content */
    .modal-overlay {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.48);
      z-index: 1200;
      padding: 20px;
    }

    .modal-content {
      width: 560px;
      max-width: 100%;
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.18);
      padding: 18px 20px;
      color: #222;
      font-family: inherit;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 600;
    }

    .modal-close {
      background: transparent;
      border: none;
      font-size: 1.15rem;
      cursor: pointer;
      color: #444;
    }

    /* Form layout */
    .modal-form .form-row {
      display: flex;
      gap: 12px;
    }

    .modal-form .form-group {
      margin-bottom: 10px;
    }

    .modal-form .form-control {
      width: 100%;
      padding: 8px 10px;
      border-radius: 6px;
      border: 1px solid #d2d8de;
      background: #fff;
      box-sizing: border-box;
      font-size: 0.95rem;
    }

    .error-message { color: #b32a2a; font-size: 0.85rem; margin-top: 4px; }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 8px;
    }

    .btn {
      padding: 8px 12px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.95rem;
    }

    .btn-primary { background: #0d6efd; color: white; }
    .btn-secondary { background: #6c757d; color: white; }

    /* Page header and controls */
    .page-header {
      display:flex;
      align-items:center;
      justify-content:space-between;
      margin-bottom:14px;
      gap:12px;
    }

    .page-header h2 { margin:0; font-size:1.25rem; }

    .page-header .btn-primary {
      display:inline-flex;
      align-items:center;
      gap:8px;
      padding:8px 12px;
      border-radius:8px;
    }

    /* Table adjustments */
    .data-table th, .data-table td {
      padding: 10px 12px;
      text-align: left;
      vertical-align: middle;
    }

    .user-avatar, .name-avatar {
      display:inline-flex;
      align-items:center;
      justify-content:center;
      width:34px;
      height:34px;
      border-radius:50%;
      background:#eef4ff;
      color:#0d6efd;
      font-weight:700;
      margin-right:8px;
    }

    @media (max-width:640px) {
      .modal-content { width: 100%; padding: 14px; }
      .modal-form .form-row { flex-direction: column; }
    }
    .inline-confirm { display:inline-flex; gap:8px; align-items:center; }
    .confirm-text { font-size:0.9rem; color:#374151; margin-right:6px; }
    .btn-sm { padding:6px 8px; border-radius:6px; font-size:0.85rem; }
    `
  ]
})
export class UsuariosComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = false;
  submitting = false;
  errorMessage = '';
  searchTerm = '';
  selectedRole = '';
  selectedActive = '';
  showModal = false;
  editingUser: User | null = null;
  // confirmation handled via ConfirmService

  userForm: FormGroup;

  constructor(private fb: FormBuilder, private usuariosService: UsuariosService, private confirmService: ConfirmService, private notification: NotificationService) {
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
        this.errorMessage = 'No se pudieron cargar los usuarios. Intenta nuevamente.';
        this.notification.show('No se pudieron cargar los usuarios desde el servidor', 'error');
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
    this.onDeleteClicked(id);
  }
  onDeleteClicked(id: string) {
    this.confirmService.confirm({
      title: 'Eliminar usuario',
      message: '¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar'
    }).then((confirmed: boolean) => {
      if (!confirmed) return;
      this.submitting = true;
      this.usuariosService.delete(Number(id)).subscribe({
        next: () => {
          this.reloadUsers();
          this.submitting = false;
          this.notification.show('Usuario eliminado correctamente', 'success', 4000, 'bottom-right');
        },
        error: (err) => {
            this.submitting = false;
            this.notification.show('No se pudo eliminar el usuario', 'error');
        }
      });
      }).catch(err => { this.notification.show('Error en confirmación', 'error'); });
  }

  toggleUserStatus(user: User) {
    const index = this.users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      const updated = { active: !this.users[index].active };
      // call backend update if available
      this.submitting = true;
      this.usuariosService.update(Number(user.id), { role: user.role, nombre: user.name, email: user.email }).subscribe({
        next: () => {
          this.reloadUsers();
          this.submitting = false;
        },
        error: () => {
          this.submitting = false;
          this.notification.show('No se pudo actualizar el estado del usuario', 'error');
        }
      });
    }
  }

  onSubmit() {
    if (this.userForm.valid) {
      const formData = this.userForm.value;
      this.submitting = true;
      if (this.editingUser) {
        // update via backend
        const payload: any = { nombre: formData.name, email: formData.email, role: formData.role };
        if (formData.password) payload.password = formData.password;
        // Debug: show what we are sending to the server (temporary)
        this.notification.show(`Enviando UPDATE: email=${payload.email}`, 'info', 6000);
        this.usuariosService.update(Number(this.editingUser.id), payload).subscribe({
          next: () => {
            // refresh the single user from server to ensure displayed fields match backend
            const id = Number(this.editingUser?.id);
            if (id) {
              this.usuariosService.get(id).subscribe({
                next: (u) => {
                  // map DTO -> User and replace in local list
                  const updated: User = {
                    id: String(u.id),
                    name: u.nombre ?? u.username,
                    email: u.email ?? '',
                    role: u.role ?? 'Empleado',
                    active: true,
                    createdAt: new Date()
                  } as User;
                  const idx = this.users.findIndex(x => x.id === String(u.id));
                  if (idx !== -1) this.users[idx] = updated;
                  this.filterUsers();
                  this.submitting = false;
                  this.closeModal();
                  // Debug: show what the server returned for email
                  this.notification.show(`Server returned email: ${u.email ?? '(empty)'}`, 'info', 6000);
                  this.notification.show('Usuario actualizado correctamente', 'success');
                },
                error: () => {
                  // fallback: reload full list
                  this.reloadUsers();
                  this.submitting = false;
                  this.closeModal();
                  this.notification.show('Usuario actualizado (refrescando lista)', 'success');
                }
              });
            } else {
              this.reloadUsers();
              this.submitting = false;
              this.closeModal();
              this.notification.show('Usuario actualizado correctamente', 'success');
            }
          },
            error: (err) => { this.submitting = false; this.notification.show('Error actualizando usuario', 'error'); }
        });
      } else {
        // create via backend
        const username = formData.email ?? formData.name.replace(/\s+/g, '').toLowerCase();
        const payload = { username, password: formData.password, nombre: formData.name, email: formData.email, role: formData.role };
        this.usuariosService.create(payload).subscribe({
          next: () => { this.reloadUsers(); this.submitting = false; this.closeModal(); this.notification.show('Usuario creado correctamente', 'success'); },
            error: (err) => { this.submitting = false; this.notification.show('Error creando usuario', 'error'); }
        });
      }
    }
  }

  private reloadUsers() {
    this.loading = true;
    this.usuariosService.list().subscribe({
      next: (users: UsuarioDto[]) => {
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
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES');
  }
}

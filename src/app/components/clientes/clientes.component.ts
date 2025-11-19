import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Client, CreateClientRequest } from '../../models/client.model';
import { ClientesService } from '../../services/clientes.service';
import { Cliente as ClienteApi, CreateClienteDto, UpdateClienteDto } from '../../models/cliente.model';
import { ConfirmService } from '../../services/confirm.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="clientes">
      <div class="page-header">
        <h2>Gestión de Clientes</h2>
        <button class="btn btn-primary" (click)="openModal()">
          <span class="btn-icon">➕</span>
          Nuevo Cliente
        </button>
      </div>

      <div class="filters-section">
        <div class="filter-group">
          <label>Buscar:</label>
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (ngModelChange)="filterClients()"
            placeholder="Buscar por nombre, email o teléfono..."
            class="search-input"
          >
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Total Reservas</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let client of filteredClients">
              <td>
                <div class="client-name">
                  <div class="name-avatar">{{ client.name.charAt(0) }}</div>
                  <span>{{ client.name }}</span>
                </div>
              </td>
              <td>{{ client.email }}</td>
              <td>
                <span class="phone-number">{{ client.phone }}</span>
              </td>
              <td>{{ client.address || 'No especificada' }}</td>
              <td>
                <span class="reservation-count">{{ client.totalReservations }}</span>
              </td>
              <td>{{ formatDate(client.createdAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button
                    class="btn-action btn-edit"
                    (click)="editClient(client)"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    class="btn-action btn-delete"
                    (click)="onDeleteClicked(client.id)"
                    [disabled]="isSubmitting"
                    title="Eliminar"
                  >
                    <span *ngIf="!isSubmitting">🗑️</span>
                    <span *ngIf="isSubmitting">⏳</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal -->
      <div class="modal-overlay clientes-modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-content clientes-modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header clientes-modal-header">
            <h3 class="modal-title">{{ editingClient ? 'Editar' : 'Nuevo' }} Cliente</h3>
            <button class="modal-close" (click)="closeModal()" aria-label="Cerrar">✕</button>
          </div>

          <form [formGroup]="clientForm" (ngSubmit)="onSubmit()" class="modal-form clientes-modal-form">
            <div class="form-group">
              <label>Nombre Completo *</label>
              <input
                type="text"
                formControlName="name"
                class="form-control"
                placeholder="Ej: Juan Pérez García"
              >
              <div class="error-message" *ngIf="clientForm.get('name')?.invalid && clientForm.get('name')?.touched">
                Nombre es requerido
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  formControlName="email"
                  class="form-control"
                  placeholder="ejemplo@email.com"
                >
                <div class="error-message" *ngIf="clientForm.get('email')?.invalid && clientForm.get('email')?.touched">
                  <span *ngIf="clientForm.get('email')?.errors?.['required']">Email es requerido</span>
                  <span *ngIf="clientForm.get('email')?.errors?.['email']">Email no es válido</span>
                </div>
              </div>

              <div class="form-group">
                <label>Teléfono *</label>
                <input
                  type="tel"
                  formControlName="phone"
                  class="form-control"
                  placeholder="555-0123"
                >
                <div class="error-message" *ngIf="clientForm.get('phone')?.invalid && clientForm.get('phone')?.touched">
                  Teléfono es requerido
                </div>
                </div>

            </div>

            <div class="form-group">
              <label>Dirección</label>
              <textarea
                formControlName="address"
                class="form-control"
                rows="3"
                placeholder="Dirección completa (opcional)"
              ></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">
                Cancelar
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="clientForm.invalid"
              >
                {{ editingClient ? 'Actualizar' : 'Crear' }} Cliente
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    /* Component-scoped Clientes styles (BoltNew-inspired modal) */
    .clientes { padding: 24px; min-height: 100%; background: #f8fafc; }

    .page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:32px; }
    .page-header h2 { margin:0; font-size:1.875rem; font-weight:700; color:#0f172a; }

    .filters-section { background:white; padding:16px; border-radius:12px; box-shadow:0 1px 3px rgba(2,6,23,0.04); margin-bottom:20px; }

    .table-container { background:white; border-radius:12px; box-shadow:0 1px 3px rgba(2,6,23,0.04); overflow:hidden; }
    .data-table th, .data-table td { padding:12px 16px; }

    /* Modal base */
    .modal-overlay { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(2,6,23,0.45); z-index:2000; padding:20px; }

    .modal-content { background:var(--white); border-radius:12px; width:100%; max-width:560px; max-height:90vh; overflow-y:auto; box-shadow:0 24px 48px rgba(2,6,23,0.12); }

    .modal-header { padding:18px 20px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #f1f5f9; }
    .modal-title { margin:0; font-size:1.125rem; font-weight:700; color:#0f172a; }
    .modal-close { background:transparent; border:none; font-size:1.05rem; color:#475569; padding:6px; border-radius:6px; cursor:pointer; }
    .modal-close:hover { background:#f1f5f9; color:#0f172a; }

    .modal-form { padding:14px 20px 20px 20px; }
    .form-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .form-group { display:flex; flex-direction:column; gap:8px; margin-bottom:14px; }

    .form-control { padding:10px 12px; border:1px solid #e6eefb; border-radius:8px; font-size:0.95rem; background:#fbfdff; transition:box-shadow .12s ease, border-color .12s ease; }
    .form-control:focus { outline:none; box-shadow:0 6px 18px rgba(59,130,246,0.12); border-color:#3b82f6; }

    .error-message { color:#dc2626; font-size:0.85rem; }

    .modal-actions { display:flex; justify-content:flex-end; gap:10px; margin-top:8px; padding-top:10px; border-top:1px solid #f8fafc; }
    .btn-primary { min-width:130px; }

    /* Clientes-specific modifiers */
    .clientes-modal-overlay { background: rgba(2,6,23,0.55) !important; }
    .clientes-modal-content { border-radius:12px !important; }

    @media (max-width: 640px) { .form-row { grid-template-columns: 1fr; } .modal-content { margin:10px; max-width:100%; } }
    .inline-confirm { display:inline-flex; gap:8px; align-items:center; }
    .confirm-text { font-size:0.9rem; color:#374151; margin-right:6px; }
    .btn-sm { padding:6px 8px; border-radius:6px; font-size:0.85rem; }
    `
  ]
})
export class ClientesComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  searchTerm = '';
  showModal = false;
  editingClient: Client | null = null;
  isLoading = false;
  isSubmitting = false;

  clientForm: FormGroup;

  constructor(private fb: FormBuilder, private clientesService: ClientesService, private confirmService: ConfirmService, private notification: NotificationService) {
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['']
    });
  }

  ngOnInit() {
    this.loadClients();
  }
  private loadClients() {
    this.isLoading = true;
    this.clientesService.list().subscribe({
      next: (list: ClienteApi[]) => {
        // Map API Cliente -> view Client
        this.clients = list.map(c => ({
          id: String(c.clienteId),
          name: `${c.nombre}${c.apellido ? ' ' + c.apellido : ''}`.trim(),
          email: c.email ?? '',
          phone: c.telefono ?? '',
          // backend may return 'direccion' or older 'nota' field — prefer 'direccion'
          address: (c as any).direccion ?? c.nota ?? '',
          createdAt: undefined,
          totalReservations: 0
        } as Client));
        this.filterClients();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        // keep previous data if any
      }
    });
  }

  filterClients() {
    if (!this.searchTerm) {
      this.filteredClients = [...this.clients];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredClients = this.clients.filter(client =>
        client.name.toLowerCase().includes(term) ||
        (client.email || '').toLowerCase().includes(term) ||
        (client.phone || '').includes(term)
      );
    }
  }

  openModal() {
    this.showModal = true;
    this.editingClient = null;
    this.clientForm.reset();
  }

  closeModal() {
    this.showModal = false;
    this.editingClient = null;
  }

  editClient(client: Client) {
    this.editingClient = client;
    this.showModal = true;

    this.clientForm.patchValue({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address
    });
  }

  onDeleteClicked(id: string) {
    this.confirmService.confirm({
      title: 'Eliminar cliente',
      message: '¿Está seguro de eliminar este cliente? Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar'
    }).then((confirmed: boolean) => {
      if (!confirmed) return;
      this.isSubmitting = true;
      const clienteId = Number(id);
      this.clientesService.delete(clienteId).subscribe({
        next: () => {
          this.loadClients();
          this.isSubmitting = false;
          this.notification.show('Cliente eliminado correctamente', 'success', 4000, 'bottom-right');
        },
        complete: () => {},
        error: () => {
          this.isSubmitting = false;
          this.notification.show('No se pudo eliminar el cliente.', 'error');
        }
      });
    }).catch(err => { this.notification.show('Error en confirmación', 'error'); });
  }

  onSubmit() {
    if (this.clientForm.valid) {
      const formData = this.clientForm.value as CreateClientRequest;
      this.isSubmitting = true;
      if (this.editingClient) {
        // Update existing
        const clienteId = Number(this.editingClient.id);
        const dto: UpdateClienteDto = {
          nombre: formData.name,
          email: formData.email,
          telefono: formData.phone,
          // send both for compatibility: 'nota' kept, 'direccion' preferred by backend
          nota: formData.address,
          direccion: formData.address
        };
        this.clientesService.update(clienteId, dto).subscribe({
          next: () => { this.loadClients(); this.isSubmitting = false; this.closeModal(); this.notification.show('Cliente actualizado correctamente', 'success'); },
          error: () => { this.isSubmitting = false; this.notification.show('Error actualizando cliente', 'error'); }
        });
      } else {
        // Create
        const dto: CreateClienteDto = {
          nombre: formData.name,
          email: formData.email,
          telefono: formData.phone,
          // include both keys to ensure backend receives the address regardless of field name
          nota: formData.address,
          direccion: formData.address
        };
        this.clientesService.create(dto).subscribe({
          next: () => { this.loadClients(); this.isSubmitting = false; this.closeModal(); this.notification.show('Cliente creado correctamente', 'success'); },
          error: () => { this.isSubmitting = false; this.notification.show('Error creando cliente', 'error'); }
        });
      }
    }
  }

  formatDate(date?: Date): string {
    return date ? date.toLocaleDateString('es-ES') : '';
  }
}

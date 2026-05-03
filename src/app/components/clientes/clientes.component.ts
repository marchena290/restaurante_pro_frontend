import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Client, CreateClientRequest } from '../../models/client.model';
import { ClientesService } from '../../services/clientes.service';
import { ReservacionesService } from '../../services/reservaciones.service';
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
    /* Component-scoped Clientes styles - Compact like Menus */
    .clientes { padding: 16px; min-height: 100%; background: #f8fafc; }

    .page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; gap:12px }
    .page-header h2 { margin:0; font-size:1.3rem; font-weight:700; color:#0f172a; }

    .filters-section { background:white; padding:8px 10px; border-radius:10px; box-shadow:0 1px 3px rgba(2,6,23,0.04); margin-bottom:12px; }
    .filter-group { display:flex; flex-direction:column; gap:4px }
    .filter-group label { font-size:0.8rem; font-weight:600; color:#475569 }

    .table-container { background:white; border-radius:10px; box-shadow:0 1px 3px rgba(2,6,23,0.04); overflow:hidden; }
    .data-table { width:100%; border-collapse:collapse; font-size:0.9rem }
    .data-table th { padding:8px 10px; text-align:left; font-weight:600; background:#f9fafb; color:#475569; font-size:0.85rem; border-bottom:1px solid #e5e7eb }
    .data-table td { padding:8px 10px; border-bottom:1px solid #f3f4f6 }
    .data-table tr:hover { background:#fbfdff }

    .client-name { display:flex; align-items:center; gap:6px }
    .name-avatar { width:32px; height:32px; border-radius:50%; background:#3b82f6; color:white; display:flex; align-items:center; justify-content:center; font-weight:600; font-size:0.85rem }
    .phone-number { font-family:monospace; font-size:0.85rem; color:#6b7280 }
    .reservation-count { display:inline-block; min-width:24px; text-align:center; padding:2px 4px; border-radius:4px; background:rgba(59,130,246,0.1); color:#2563eb; font-weight:600; font-size:0.85rem }

    /* Actions */
    .action-buttons { display:flex; gap:4px }
    .btn-action { background:transparent; border:none; cursor:pointer; padding:4px; border-radius:6px; font-size:0.95rem }
    .btn-action:hover { background:#f1f5f9 }

    /* Modal styles */
    .modal-overlay { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(2,6,23,0.45); z-index:2000; padding:16px }

    .modal-content { background:white; border-radius:10px; width:100%; max-width:500px; max-height:85vh; overflow-y:auto; box-shadow:0 20px 40px rgba(2,6,23,0.12) }

    .modal-header { padding:12px 14px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #f1f5f9 }
    .modal-header h3 { margin:0; font-size:0.95rem; font-weight:700; color:#0f172a }
    .modal-close { background:transparent; border:none; font-size:1rem; color:#6b7280; padding:2px 4px; border-radius:4px; cursor:pointer }
    .modal-close:hover { background:#f1f5f9; color:#0f172a }

    .modal-form { padding:10px 14px }
    .form-group { display:flex; flex-direction:column; gap:4px; margin-bottom:10px }
    .form-group label { font-size:0.85rem; font-weight:600; color:#0f172a }
    .form-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px }

    .form-control { padding:6px 8px; border:1px solid #e5e7eb; border-radius:6px; font-size:0.85rem; background:#fbfdff }
    .form-control:focus { outline:none; box-shadow:0 4px 12px rgba(59,130,246,0.1); border-color:#3b82f6 }

    .error-message { color:#dc2626; font-size:0.75rem; margin-top:2px }

    .modal-actions { display:flex; justify-content:flex-end; gap:6px; padding:8px 14px 10px; border-top:1px solid #f1f5f9 }
    .btn { padding:6px 10px; border-radius:6px; font-weight:600; border:none; cursor:pointer; font-size:0.85rem }
    .btn-primary { background:#2563eb; color:white; min-width:100px }
    .btn-secondary { background:#f3f4f6; color:#0f172a }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .clientes { padding: 10px }
      .page-header { flex-direction: column; align-items: flex-start; gap: 8px; margin-bottom: 10px }
      .page-header h2 { font-size: 1.1rem }
      .filters-section { padding: 6px 8px; margin-bottom: 10px }
      .data-table th, .data-table td { padding: 6px 8px; font-size: 0.85rem }
      .data-table thead { display: none }
      .data-table tbody tr { display: block; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 8px; background: white; padding: 8px }
      .data-table td { display: block; padding: 4px 0; border: none; margin-bottom: 4px }
      .data-table td::before { content: attr(data-label); display: block; font-weight: 600; color: #6b7280; font-size: 0.75rem; margin-bottom: 2px }
      .modal-content { max-width: 95% }
      .form-row { grid-template-columns: 1fr }
    }
    @media (max-width: 640px) {
      .filters-section { padding: 6px }
      .data-table td { font-size: 0.8rem }
      .modal-form { padding: 8px 10px }
      .form-group { margin-bottom: 8px }
    }
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

  constructor(private fb: FormBuilder, private clientesService: ClientesService, private reservasService: ReservacionesService, private confirmService: ConfirmService, private notification: NotificationService) {
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
        this.clients = list.map(c => {
          const anyc = c as any;
          // detect createdAt-like fields from backend
          const createdRaw = anyc.createdAt ?? anyc.fechaRegistro ?? anyc.creadoEn ?? anyc.creado_at ?? anyc.fecha_creacion ?? anyc.fechaAlta ?? anyc.created_at;
          const createdAt = createdRaw ? new Date(createdRaw) : undefined;

          // detect total reservations field from backend using multiple possible names
          const totalRaw = anyc.totalReservations ?? anyc.totalReservas ?? anyc.reservasCount ?? anyc.reservas_totales ?? anyc.total_reservas ?? anyc.total ?? anyc.cantidadReservas;
          const totalReservations = typeof totalRaw === 'number' ? totalRaw : (typeof totalRaw === 'string' && totalRaw.trim() !== '' ? Number(totalRaw) : 0);

          return ({
            id: String(c.clienteId),
            name: `${c.nombre}${c.apellido ? ' ' + c.apellido : ''}`.trim(),
            email: c.email ?? '',
            phone: c.telefono ?? '',
            // backend may return 'direccion' or older 'nota' field — prefer 'direccion'
            address: anyc.direccion ?? anyc.nota ?? '',
            createdAt: createdAt,
            totalReservations: totalReservations
          } as Client);
        });
        // After loading clients, fetch reservations to compute total per client (client-side fallback)
        this.reservasService.list().subscribe({
          next: reservas => {
            try {
              const counts: Record<string, number> = {};
              const earliest: Record<string, number> = {};
              (reservas || []).forEach((r: any) => {
                const cid = r.clienteId ?? (r.cliente && (r.cliente.clienteId ?? r.cliente.id));
                if (!cid) return;
                const key = String(cid);
                counts[key] = (counts[key] || 0) + 1;
                // parse fechaHoraInicio if present to compute earliest
                const fecha = r.fechaHoraInicio ?? r.fechaReserva ?? r.fecha ?? null;
                if (fecha) {
                  const ts = Date.parse(fecha);
                  if (!Number.isNaN(ts)) {
                    if (!earliest[key] || ts < earliest[key]) earliest[key] = ts;
                  }
                }
              });

              this.clients = this.clients.map(c => {
                const created = c.createdAt || (earliest[c.id] ? new Date(earliest[c.id]) : undefined);
                return ({ ...c, totalReservations: counts[c.id] || 0, createdAt: created });
              });
            } catch (e) {
              console.error('Error computing client reservation counts/dates', e);
            }
            this.filterClients();
            this.isLoading = false;
          },
          error: () => { this.filterClients(); this.isLoading = false; }
        });
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

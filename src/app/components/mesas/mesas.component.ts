import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from '../../models/table.model';
import { MesasService } from '../../services/mesas.service';
import { Mesa } from '../../models/mesa.model';
import { ReservacionesService } from '../../services/reservaciones.service';
import { AuthService } from '../../services/auth.service';
import { ConfirmService } from '../../services/confirm.service';
import { NotificationService } from '../../services/notification.service';
import { humanizeEstadoReserva } from '../../utils/estado-reserva.util';

@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="mesas">
      <div class="page-header">
        <h2>Gestión de Mesas</h2>
        <button class="btn btn-primary" (click)="openModal()">
          <span class="btn-icon">➕</span>
          Nueva Mesa
        </button>
      </div>

      <div class="filters-section">
        <div class="filter-group">
          <label>Buscar:</label>
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (ngModelChange)="filterTables()"
            placeholder="Buscar por nombre o ubicación..."
            class="search-input"
          >
        </div>
        <div class="filter-group">
          <label>Estado:</label>
          <select [(ngModel)]="selectedStatus" (ngModelChange)="filterTables()" class="filter-select">
            <option value="">Todos</option>
            <option value="Disponible">Disponible</option>
            <option value="Ocupada">Ocupada</option>
            <option value="Reservada">Reservada</option>
            <option value="Mantenimiento">Mantenimiento</option>
          </select>
        </div>
      </div>

      <div class="tables-grid">
        <div *ngFor="let table of filteredTables"
             class="table-card"
             [class]="'status-' + table.status.toLowerCase().replace(' ', '-')">
          <div class="table-header">
            <div class="table-name">{{ table.name }}</div>
            <div class="table-actions">
              <button
                class="btn-action btn-edit"
                (click)="editTable(table)"
                title="Editar"
              >
                ✏️
              </button>
              <button
                class="btn-action btn-delete"
                (click)="deleteTable(table.id)"
                title="Eliminar"
              >
                🗑️
              </button>
            </div>
          </div>

          <div class="table-details">
            <div class="detail-item">
              <span class="detail-icon">👥</span>
              <span class="detail-text">{{ table.capacity }} personas</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">📍</span>
              <span class="detail-text">{{ table.location }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">📅</span>
              <span class="detail-text">{{ formatDate(table.createdAt) }}</span>
            </div>
            <div class="detail-item" *ngIf="nextReservations[table.id]">
              <span class="detail-icon">⏰</span>
              <span class="detail-text">Próx.: {{ nextReservations[table.id] }}</span>
            </div>
          </div>

          <div class="table-status">
            <span class="status-indicator"></span>
            <span class="status-text">{{ table.status }}</span>
          </div>

          <div class="table-quick-actions" *ngIf="table.status === 'Disponible'">
            <button class="quick-action-btn occupied" (click)="changeStatus(table, 'Ocupada')">
              Marcar Ocupada
            </button>
            <button class="quick-action-btn reserved" (click)="changeStatus(table, 'Reservada')">
              Marcar Reservada
            </button>
            <button class="quick-action-btn checkin" *ngIf="canCheckIn && nextReservations[table.id]" (click)="checkInFromTable(table)">
              Check‑in
            </button>
          </div>

          <div class="table-quick-actions" *ngIf="table.status === 'Ocupada'">
            <button class="quick-action-btn available" (click)="changeStatus(table, 'Disponible')">
              Liberar Mesa
            </button>
            <button class="quick-action-btn maintenance" (click)="changeStatus(table, 'Mantenimiento')">
              Mantenimiento
            </button>
          </div>

          <div class="table-quick-actions" *ngIf="table.status === 'Reservada'">
            <button class="quick-action-btn occupied" (click)="changeStatus(table, 'Ocupada')">
              Confirmar Llegada
            </button>
            <button class="quick-action-btn available" (click)="changeStatus(table, 'Disponible')">
              Cancelar Reserva
            </button>
          </div>

          <div class="table-quick-actions" *ngIf="table.status === 'Mantenimiento'">
            <button class="quick-action-btn available" (click)="changeStatus(table, 'Disponible')">
              Marcar Disponible
            </button>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-section">
        <div class="stat-card available">
          <div class="stat-number">{{ getTableCount('Disponible') }}</div>
          <div class="stat-label">Disponibles</div>
        </div>
        <div class="stat-card occupied">
          <div class="stat-number">{{ getTableCount('Ocupada') }}</div>
          <div class="stat-label">Ocupadas</div>
        </div>
        <div class="stat-card reserved">
          <div class="stat-number">{{ getTableCount('Reservada') }}</div>
          <div class="stat-label">Reservadas</div>
        </div>
        <div class="stat-card maintenance">
          <div class="stat-number">{{ getTableCount('Mantenimiento') }}</div>
          <div class="stat-label">Mantenimiento</div>
        </div>
      </div>

      <!-- Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingTable ? 'Editar' : 'Nueva' }} Mesa</h3>
            <button class="modal-close" (click)="closeModal()">✕</button>
          </div>

          <form [formGroup]="tableForm" (ngSubmit)="onSubmit()" class="modal-form">
              <div class="form-group">
                <label>Número de la Mesa *</label>
                <input
                  type="number"
                  formControlName="numero"
                  class="form-control"
                  placeholder="Ej: 1"
                  min="1"
                >
                <div class="error-message" *ngIf="tableForm.get('numero')?.invalid && tableForm.get('numero')?.touched">
                  Número es requerido y debe ser mayor que 0
                </div>
              </div>

            <div class="form-row">
              <div class="form-group">
                <label>Capacidad *</label>
                <input
                  type="number"
                  formControlName="capacity"
                  class="form-control"
                  min="1"
                  max="20"
                  placeholder="4"
                >
                <div class="error-message" *ngIf="tableForm.get('capacity')?.invalid && tableForm.get('capacity')?.touched">
                  <span *ngIf="tableForm.get('capacity')?.errors?.['required']">Capacidad es requerida</span>
                  <span *ngIf="tableForm.get('capacity')?.errors?.['min'] || tableForm.get('capacity')?.errors?.['max']">
                    Capacidad debe ser entre 1 y 20
                  </span>
                </div>
              </div>

              <div class="form-group" *ngIf="editingTable">
                <label>Estado</label>
                <select formControlName="status" class="form-control">
                  <option value="Disponible">Disponible</option>
                  <option value="Ocupada">Ocupada</option>
                  <option value="Reservada">Reservada</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Ubicación *</label>
              <select formControlName="location" class="form-control">
                <option value="">Seleccionar ubicación</option>
                <option value="Interior">Interior</option>
                <option value="Terraza">Terraza</option>
                <option value="Patio">Patio</option>
                <option value="Área VIP">Área VIP</option>
                <option value="Barra">Barra</option>
              </select>
              <div class="error-message" *ngIf="tableForm.get('location')?.invalid && tableForm.get('location')?.touched">
                Ubicación es requerida
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">
                Cancelar
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="tableForm.invalid"
              >
                {{ editingTable ? 'Actualizar' : 'Crear' }} Mesa
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    /* Minimal, non-invasive modal polish - visual only, no logic changes */
    .modal-overlay {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.38);
      z-index: 10000;
      padding: 16px;
    }

    .modal-content {
      width: 560px;
      max-width: 100%;
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(2,6,23,0.12);
      padding: 18px;
      color: #0f172a;
    }

    .modal-header { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:10px }
    .modal-header h3 { margin:0; font-size:1.05rem; font-weight:700 }
    .modal-close { background:transparent; border:none; font-size:1.1rem; cursor:pointer }

    .modal-form { display:block }
    .form-group { margin-bottom:10px; display:flex; flex-direction:column }
    .form-group label { margin-bottom:6px; font-weight:600; color:#0f172a }
    .form-control { padding:8px 10px; border-radius:8px; border:1px solid #e6e9ee; font-size:0.95rem }
    .form-row { display:flex; gap:10px }
    .form-row .form-group { flex:1 }

    .error-message { color:#dc2626; font-size:0.85rem; margin-top:6px }

    .modal-actions { display:flex; gap:10px; justify-content:flex-end; margin-top:8px }
    .btn { padding:8px 12px; border-radius:8px; font-weight:600; border:none; cursor:pointer }
    .btn-primary { background:#2563eb; color:#fff }
    .btn-secondary { background:#f3f4f6; color:#0f172a }

    @media (max-width:600px) {
      .modal-content { width: 100%; padding:14px }
      .form-row { flex-direction:column }
    }
    `
  ]
})
export class MesasComponent implements OnInit {
  tables: Table[] = [];
  filteredTables: Table[] = [];
  searchTerm = '';
  selectedStatus = '';
  showModal = false;
  editingTable: Table | null = null;

  tableForm: FormGroup;

  // map of tableId -> formatted next reservation label
  nextReservations: Record<string, string> = {};
  // map of tableId -> reservation object (raw) for quick access
  nextReservationInfo: Record<string, any> = {};

  constructor(private fb: FormBuilder,
              private mesasService: MesasService,
              private confirmService: ConfirmService,
              private notification: NotificationService,
              private reservasService: ReservacionesService,
              private auth: AuthService) {
    this.tableForm = this.fb.group({
      numero: [1, [Validators.required, Validators.min(1)]],
      capacity: [4, [Validators.required, Validators.min(1), Validators.max(20)]],
      location: ['', Validators.required],
      status: ['Disponible']
    });
  }

  ngOnInit() {
    this.loadTables();
  }
  private loadTables() {
    this.mesasService.list().subscribe({
      next: (list: Mesa[]) => {
        this.tables = list.map(m => this.mapMesaToTable(m));
        // Aplicar ubicaciones guardadas en localStorage como fallback si el backend no las devuelve
        const stored = this.loadLocationsFromStorage();
        this.tables = this.tables.map(t => {
          if ((!t.location || t.location === '') && stored[t.id]) {
            return { ...t, location: stored[t.id] } as Table;
          }
          return t;
        });
        this.filterTables();
        // load next reservations for tables
        this.loadNextReservations();
      },
      error: () => {
        // fallback to empty list on error
        this.tables = [];
        this.filterTables();
      }
    });
  }

  private loadNextReservations() {
    this.reservasService.list().subscribe({
      next: (reservas: any[]) => {
        try {
          const now = Date.now();
          // group reservations by mesaId and pick the next upcoming (fechaHoraInicio >= now)
          const byTable: Record<string, any[]> = {};
          reservas.forEach(r => {
            // mesaId can be numeric or an object like { mesaId: 9, numeroMesa: 10 }
            let mid = '';
            try {
              if (r === null || r === undefined) return;
              if (typeof r.mesaId === 'number' || typeof r.mesaId === 'string') mid = String(r.mesaId);
              else if (r.mesaId && typeof r.mesaId === 'object' && (r.mesaId.mesaId || r.mesaId.mesaId === 0)) mid = String(r.mesaId.mesaId);
              else if (r.mesa && typeof r.mesa === 'object' && (r.mesa.mesaId || r.mesa.mesaId === 0)) mid = String(r.mesa.mesaId);
            } catch (e) {
              mid = '';
            }
            if (!mid) return;
            // skip cancelled
            const estado = (r.estado || '').toString().toLowerCase();
            if (estado.includes('cancel') || estado.includes('cancelada')) return;
            const ts = r.fechaHoraInicio ? Date.parse(r.fechaHoraInicio) : 0;
            if (!byTable[mid]) byTable[mid] = [];
            byTable[mid].push({ ...r, ts });
          });

          Object.keys(byTable).forEach(tid => {
            const list = byTable[tid].filter(x => x.ts >= now).sort((a,b) => a.ts - b.ts);
            if (list.length) {
              const next = list[0];
              this.nextReservations[tid] = new Date(next.ts).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
              this.nextReservationInfo[tid] = next;
            } else {
              delete this.nextReservations[tid];
              delete this.nextReservationInfo[tid];
            }
          });
        } catch (e) {
          console.warn('Error computing next reservations', e);
        }
      },
      error: () => { /* ignore */ }
    });
  }

  get canCheckIn(): boolean {
    return this.auth.hasRole('ADMIN') || this.auth.hasRole('EMPLEADO');
  }

  checkInFromTable(table: Table) {
    // mark mesa as ocupada and optionally set reservation to EN_CURSO
    const mesaId = Number(table.id);
    // optimistic UI
    const prevStatus = table.status;
    table.status = 'Ocupada';
    this.filterTables();

    this.changeStatus(table, 'Ocupada');

    // if there is a next reservation, attempt to set it EN_CURSO
    const info = this.nextReservationInfo[table.id];
    if (info && info.reservaId) {
      try {
        this.reservasService.changeEstado(info.reservaId, { estado: 'EN_CURSO' }).subscribe({
          next: (updatedReserva: any) => {
            const title = humanizeEstadoReserva(updatedReserva?.estado) || 'Reserva actualizada';
            this.notification.show(title, 'success');
            // refresh reservations map
            this.loadNextReservations();
          },
          error: (err: any) => {
            // Prefer server message when available
            const serverMsg = err && err.error && (err.error.mensaje || err.error.message);
            const message = serverMsg || 'No se pudo actualizar la reserva';
            this.notification.show(message, 'error');
          }
        });
      } catch (e) {
        console.warn('checkInFromTable reservation update failed', e);
      }
    }
  }

  private loadLocationsFromStorage(): Record<string, string> {
    try {
      const raw = localStorage.getItem('mesa_locations');
      if (!raw) return {};
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error leyendo ubicaciones desde localStorage', e);
      return {};
    }
  }

  private saveLocationToStorage(mesaId: number | string, location: string) {
    try {
      const key = String(mesaId);
      const cur = this.loadLocationsFromStorage();
      if (location && location !== '') cur[key] = location;
      else delete cur[key];
      localStorage.setItem('mesa_locations', JSON.stringify(cur));
    } catch (e) {
      console.error('Error guardando ubicacion en localStorage', e);
    }
  }

  private removeLocationFromStorage(mesaId: number | string) {
    try {
      const key = String(mesaId);
      const cur = this.loadLocationsFromStorage();
      if (cur[key]) {
        delete cur[key];
        localStorage.setItem('mesa_locations', JSON.stringify(cur));
      }
    } catch (e) {
      console.error('Error removiendo ubicacion de localStorage', e);
    }
  }

  private mapMesaToTable(m: Mesa): Table {
    const numero = (m as any).numeroMesa ?? m.numero ?? null;
    const estadoRaw = (m as any).estado ?? (m as any).estado;
    const mapEstado = (e: any) => {
      if (e === null || e === undefined) return 'Disponible';
      // textual values only (backend now returns enum strings)
      const s = String(e).toLowerCase();
      if (s.includes('ocup')) return 'Ocupada';
      if (s.includes('reserv')) return 'Reservada';
      if (s.includes('manten')) return 'Mantenimiento';
      if (s.includes('disp')) return 'Disponible';
      return 'Disponible';
    };

    return {
      id: String(m.mesaId),
      name: numero ? `Mesa ${numero}` : `Mesa ${m.mesaId}`,
      capacity: m.capacidad,
      location: m.ubicacion ?? '',
      status: mapEstado(estadoRaw),
      createdAt: undefined
    } as Table;
  }

  filterTables() {
    this.filteredTables = this.tables.filter(table => {
      const matchesSearch = !this.searchTerm ||
        table.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (table.location || '').toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.selectedStatus || table.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  getTableCount(status: string): number {
    return this.tables.filter(table => table.status === status).length;
  }

  changeStatus(table: Table, newStatus: string) {
    const index = this.tables.findIndex(t => t.id === table.id);
    if (index === -1) return;

    const previous = this.tables[index].status;
    // optimistic update
    this.tables[index].status = newStatus as any;
    this.filterTables();

    const mesaId = Number(table.id);
    const parsedNum = Number(String(table.name || '').replace(/[^0-9]/g, '')) || 1;
    const mapStatusToEstadoEnum = (s: string) => {
      switch ((s || '').toLowerCase()) {
        case 'ocupada': return 'OCUPADA';
        case 'reservada': return 'RESERVADA';
        case 'mantenimiento': return 'MANTENIMIENTO';
        default: return 'DISPONIBLE';
      }
    };
    const estado = mapStatusToEstadoEnum(newStatus);
    const dto: any = {
      numero: parsedNum,
      numeroMesa: parsedNum,
      'numero_mesa': parsedNum,
      capacidad: table.capacity,
      ubicacion: table.location ?? '',
      activo: newStatus !== 'Mantenimiento',
      estado
    };
    this.mesasService.update(mesaId, dto).subscribe({
      next: () => {
        this.notification.show('Estado de la mesa actualizado', 'success', 3000, 'bottom-right');
      },
      error: () => {
        // revert
        this.tables[index].status = previous;
        this.filterTables();
        this.notification.show('No se pudo actualizar el estado de la mesa', 'error');
      }
    });
  }

  openModal() {
    this.showModal = true;
    this.editingTable = null;
    this.tableForm.reset({ numero: 1, capacity: 4, status: 'Disponible' });
  }

  closeModal() {
    this.showModal = false;
    this.editingTable = null;
  }

  editTable(table: Table) {
    this.editingTable = table;
    this.showModal = true;

    const parsedNum = Number(String(table.name || '').replace(/[^0-9]/g, '')) || 1;
    this.tableForm.patchValue({
      numero: parsedNum,
      capacity: table.capacity,
      location: table.location,
      status: table.status
    });
  }

  deleteTable(id: string) {
    this.confirmService.confirm({
      title: 'Eliminar mesa',
      message: '¿Está seguro de eliminar esta mesa? Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar'
    }).then(confirmed => {
      if (!confirmed) return;
      const mesaId = Number(id);
      this.mesasService.delete(mesaId).subscribe({
        next: () => {
          this.tables = this.tables.filter(t => t.id !== id);
          this.filterTables();
          // Remover fallback de localStorage
          this.removeLocationFromStorage(id);
          this.notification.show('Mesa eliminada correctamente', 'success', 4000, 'bottom-right');
        },
        error: (err: any) => {
          // Intentar obtener el mensaje de error devuelto por el backend
          let fullReason = 'No se pudo eliminar la mesa.';
          try {
            if (err && err.error) {
              if (typeof err.error === 'string') {
                fullReason = `No se pudo eliminar la mesa: ${err.error}`;
              } else {
                const body = err.error;
                const msg = body.mensaje ?? body.message ?? null;
                if (msg) fullReason = `No se pudo eliminar la mesa: ${msg}`;
                else fullReason = `No se pudo eliminar la mesa: ${JSON.stringify(body)}`;
              }
            } else if (err && err.message) {
              fullReason = `No se pudo eliminar la mesa: ${err.message}`;
            }
          } catch (e) {
            fullReason = 'No se pudo eliminar la mesa.';
            console.error('Error parsing delete error response', e, err);
          }

          // Generar un mensaje compacto y no redundante para mostrar al usuario
          let concise = 'No se pudo eliminar la mesa.';
          try {
            const lower = String(fullReason).toLowerCase();
            // Si el backend indica cantidad de reservas, extraer el número
            const m = lower.match(/tiene\s+(\d+)\s+reserv/);
            if (m && m[1]) {
              const n = Number(m[1]);
              concise = `No se pudo eliminar: tiene ${n} reserva${n > 1 ? 's' : ''} activa${n > 1 ? 's' : ''} asociada${n > 1 ? 's' : ''}.`;
            } else if (lower.includes('reserv')) {
              concise = 'No se pudo eliminar: tiene reservas activas o futuras asociadas.';
            } else if (lower.includes('no se puede eliminar')) {
              // Usar la frase corta que ya usa el backend
              concise = 'No se pudo eliminar la mesa: tiene reservas activas o futuras.';
            }
          } catch (e) {
            concise = 'No se pudo eliminar la mesa.';
          }

          // Guardar detalle completo en consola para depuración, pero mostrar solo el mensaje compacto
          console.error('Detalle completo al intentar eliminar mesa:', err, fullReason);
          this.notification.show(concise, 'error');
        }
      });
    }).catch(() => { this.notification.show('Error en confirmación', 'error'); });
  }

  onSubmit() {
    if (this.tableForm.valid) {
      const formData = this.tableForm.value;

      if (this.editingTable) {
        const mesaId = Number(this.editingTable!.id);
        const mapStatusToEstadoEnum = (s: string) => {
          switch ((s || '').toLowerCase()) {
            case 'ocupada': return 'OCUPADA';
            case 'reservada': return 'RESERVADA';
            case 'mantenimiento': return 'MANTENIMIENTO';
            default: return 'DISPONIBLE';
          }
        };
        const estado = mapStatusToEstadoEnum(formData.status);
        const ubicacionVal = formData.location || this.editingTable?.location || '';
        const payload: any = { numero: Number(formData.numero), numeroMesa: Number(formData.numero), 'numero_mesa': Number(formData.numero), capacidad: formData.capacity, ubicacion: ubicacionVal, activo: formData.status !== 'Mantenimiento', estado };
        this.mesasService.update(mesaId, payload).subscribe({
          next: (res: Mesa) => {
            // Si el backend no devuelve ubicacion, usar el valor del formulario
            const updated = this.mapMesaToTable(res);
            if (!updated.location || updated.location === '') {
              updated.location = formData.location || this.editingTable?.location || '';
            }
            // Reemplazar en la lista local
            const idx = this.tables.findIndex(t => t.id === String(mesaId));
            if (idx !== -1) this.tables[idx] = updated;
              // Guardar ubicación en localStorage como fallback
              this.saveLocationToStorage(mesaId, updated.location || '');
            this.filterTables();
            this.closeModal();
            this.notification.show('Mesa actualizada correctamente', 'success', 3000, 'bottom-right');
          },
          error: () => { this.notification.show('Error actualizando mesa', 'error'); }
        });
      } else {
        const ubicacionVal = formData.location || '';
        const payload: any = { numero: Number(formData.numero), numeroMesa: Number(formData.numero), 'numero_mesa': Number(formData.numero), capacidad: formData.capacity, ubicacion: ubicacionVal, estado: 'DISPONIBLE' };
        this.mesasService.create(payload).subscribe({
          next: (res: Mesa) => {
            // Mapear respuesta; si backend no devuelve ubicacion, usar la del formulario
            const created = this.mapMesaToTable(res);
            if (!created.location || created.location === '') {
              created.location = formData.location || '';
            }
            // Añadir a lista local (no recargamos para evitar perder la ubicación si backend no la persiste)
              this.tables.push(created);
              // Guardar fallback en localStorage para persistir en reloads locales
              this.saveLocationToStorage(res.mesaId ?? created.id, created.location || '');
            this.filterTables();
            this.closeModal();
            this.notification.show('Mesa creada correctamente', 'success', 3000, 'bottom-right');
          },
          error: () => { this.notification.show('Error creando mesa', 'error'); }
        });
      }

      // filter/close handled in callbacks
    }
  }

  formatDate(date?: Date): string {
    return date ? date.toLocaleDateString('es-ES') : '';
  }
}

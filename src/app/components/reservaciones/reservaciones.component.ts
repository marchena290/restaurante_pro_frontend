import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Reservation } from '../../models/reservation.model';
import { Client } from '../../models/client.model';
import { Table } from '../../models/table.model';
import { ReservacionesService } from '../../services/reservaciones.service';
import { ClientesService } from '../../services/clientes.service';
import { MesasService } from '../../services/mesas.service';
import { NotificationService } from '../../services/notification.service';
import { humanizeEstadoReserva } from '../../utils/estado-reserva.util';
import { ConfirmService } from '../../services/confirm.service';
import { Reserva, CreateReservaDto, UpdateReservaDto } from '../../models/reservacion.model';

@Component({
  selector: 'app-reservaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reservaciones.component.html',
  styles: [
    `
    /* Modal overlay and content */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal-content {
      width: 100%;
      max-width: 820px;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      overflow: hidden;
      animation: modalEnter .12s ease-out;
    }

    @keyframes modalEnter { from { transform: translateY(6px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #eee;
      background: linear-gradient(90deg, #f7f9fc, #ffffff);
    }

    .modal-header h3 { margin: 0; font-size: 18px; color: #222; }
    .modal-close { background: transparent; border: none; font-size: 18px; cursor: pointer }

    .modal-form { padding: 18px 20px; display: grid; gap: 12px }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px }
    .form-group { display: flex; flex-direction: column }
    .form-group label { font-size: 13px; margin-bottom: 6px; color: #333 }

    .form-control { padding: 8px 10px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 14px }
    select.form-control { background: white }

    .error-message { color: #b00020; font-size: 12px; margin-top: 6px }

    .modal-actions { display:flex; gap: 10px; justify-content: flex-end; padding: 12px 20px 20px }

    .btn { padding: 8px 12px; border-radius: 6px; border: 1px solid transparent; cursor: pointer; font-weight: 600 }
    .btn-primary { background: #007bff; color: white }
    .btn-secondary { background: #f4f6f8; color: #222; border-color: #e6e9ee }

    /* Small screens */
    @media (max-width: 640px) {
      .form-row { grid-template-columns: 1fr }
      .modal-content { max-width: 95%; }
      .modal-actions { padding: 12px }
    }

    /* minor improvements for table/overview */
    .data-table { width: 100%; border-collapse: collapse }
    .data-table th, .data-table td { padding: 10px 8px; border-bottom: 1px solid #f0f0f0 }
    .status-badge { padding: 6px 8px; border-radius: 999px; font-size: 13px }
    `
  ]
})
export class ReservacionesComponent implements OnInit {

  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];
  clients: Client[] = [];
  availableTables: Table[] = [];

  searchTerm = '';
  selectedStatus = '';
  showModal = false;
  editingReservation: Reservation | null = null;


  reservationForm: FormGroup;

  // Mensaje de solapamiento y flag para el botón
  overlapWarning: string = '';

  // Evita envíos múltiples mientras la petición está en curso
  isSubmitting: boolean = false;

  // Verifica si hay solapamiento de reservas para la mesa, fecha y hora seleccionados
  checkOverlap() {
    if (!this.reservationForm) return;
    const form = this.reservationForm.value;
    if (!form.tableId || !form.date || !form.time) {
      this.overlapWarning = '';
      return;
    }
    // Solo considerar reservas que no sean la que se está editando
    const reservas = this.reservations.filter((r: any) => !this.editingReservation || r.id !== this.editingReservation.id);
    const inicioSeleccionado = new Date(`${form.date}T${form.time}:00`).getTime();
    const duracionSeleccionada = 60 * 60 * 1000; // 1 hora en ms
    const finSeleccionado = inicioSeleccionado + duracionSeleccionada;
    const solapada = reservas.some((r: any) => {
      if (String(r.tableId) !== String(form.tableId)) return false;
      const inicio = new Date(`${r.date}T${r.time}:00`).getTime();
      const fin = inicio + duracionSeleccionada;
      // Solapan si se cruzan los intervalos
      return fin > inicioSeleccionado && inicio < finSeleccionado;
    });
    this.overlapWarning = solapada ? 'Ya existe una reserva para esa mesa, fecha y hora.' : '';
  }


  // Getter para deshabilitar campos si la reserva está confirmada, en curso o finalizada
  get esSoloLectura(): boolean {
    if (!this.editingReservation) return false;
    const estado = (this.editingReservation.status || '').toUpperCase();
    return estado === 'CONFIRMADA' || estado === 'EN CURSO' || estado === 'FINALIZADA';
  }

  // Permite editar el estado aunque los demás campos estén deshabilitados
  get puedeEditarEstado(): boolean {
    if (!this.editingReservation) return false;
    const control = this.reservationForm.get('status');
    return !!control && !control.disabled;
  }

  constructor(
    private fb: FormBuilder,
    private reservasService: ReservacionesService,
    private clientesService: ClientesService,
    private mesasService: MesasService,
    private notification: NotificationService,
    private confirm: ConfirmService
  ) {
    this.reservationForm = this.fb.group({
      clientId: ['', Validators.required],
      tableId: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      guests: [2, [Validators.required, Validators.min(1), Validators.max(20)]],
      status: ['Pendiente'],
      notes: ['']
    });

    // Suscribirse a cambios en el formulario para validar solapamiento en tiempo real
    this.reservationForm.valueChanges.subscribe(() => this.checkOverlap());
  }

  ngOnInit() {
    this.loadData();
  }
  private loadData() {
    // load clients and tables in parallel, then reservations
    this.clientesService.list().subscribe({
      next: clients => {
        // defensive mapping in case backend uses different field names
        this.clients = (clients as any[]).map(c => ({
          id: String((c as any).id ?? (c as any).clientedId ?? (c as any).clienteId ?? ''),
          name: (c as any).name ?? (c as any).nombre ?? '',
          email: (c as any).email ?? null,
          phone: (c as any).phone ?? (c as any).telefono ?? '',
          address: (c as any).address ?? (c as any).direccion ?? null,
          createdAt: (c as any).createdAt ? new Date((c as any).createdAt) : undefined,
          totalReservations: (c as any).totalReservations ?? undefined
        } as Client));
      },
      error: err => { console.error('Error cargando clientes', err); this.notification.show('No se pudieron cargar clientes', 'error'); }
    });

    this.mesasService.list().subscribe({
      next: mesas => {
        this.availableTables = (mesas as any[]).map(m => ({
          id: String((m as any).id ?? (m as any).mesaId ?? ''),
          // prefer explicit numeroMesa (backend uses `numeroMesa`), fall back to mesaId
          name: ((): string => {
            const numero = (m as any).numeroMesa ?? (m as any).numneroMesa ?? (m as any).numero ?? undefined;
            if (numero !== undefined && numero !== null && numero !== '') return `Mesa ${String(numero)}`;
            return String((m as any).name ?? `Mesa ${(m as any).mesaId ?? ''}`);
          })(),
          capacity: (m as any).capacity ?? (m as any).capacidad ?? 0,
          status: (m as any).status ?? (m as any).estado ?? 'Disponible',
          location: (m as any).location ?? (m as any).ubicacion ?? '',
          createdAt: (m as any).createdAt ? new Date((m as any).createdAt) : undefined
        } as Table));
      },
      error: err => { console.error('Error cargando mesas', err); this.notification.show('No se pudieron cargar mesas', 'error'); }
    });

    this.reservasService.list().subscribe({
      next: reservas => {
        // map backend Reserva -> Reservation (frontend shape)
        this.reservations = reservas.map(r => this.mapReservaToReservation(r));
        this.filterReservations();
      },
      error: err => { console.error('Error cargando reservaciones', err); this.notification.show('No se pudieron cargar reservaciones', 'error'); }
    });
  }

  filterReservations() {
    this.filteredReservations = this.reservations.filter(reservation => {
      const matchesSearch = !this.searchTerm ||
        reservation.clientName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (reservation.clientPhone || '').includes(this.searchTerm) ||
        reservation.tableName.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.selectedStatus || reservation.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  openModal() {
    this.showModal = true;
    this.editingReservation = null;
    this.reservationForm.reset({ guests: 2, status: 'Pendiente' });
    // Ensure client selector is enabled when creating
    const clientControl = this.reservationForm.get('clientId');
    if (clientControl && clientControl.disabled) clientControl.enable();
  }

  closeModal() {
    this.showModal = false;
    this.editingReservation = null;
    // Re-enable client selector when closing modal
    const clientControl = this.reservationForm.get('clientId');
    if (clientControl && clientControl.disabled) clientControl.enable();
  }

  editReservation(reservation: Reservation) {
    this.editingReservation = reservation;
    this.showModal = true;

    this.reservationForm.patchValue({
      clientId: reservation.clientId,
      tableId: reservation.tableId,
      date: reservation.date,
      time: reservation.time,
      guests: reservation.guests,
      status: reservation.status,
      notes: reservation.notes
    });
    // When editing, prevent changing the client: disable the client selector
    const clientControl = this.reservationForm.get('clientId');
    if (clientControl && clientControl.enabled) clientControl.disable();
  }

  deleteReservation(id: string) {
    this.confirm.confirm({ title: 'Eliminar reservación', message: '¿Está seguro de eliminar esta reservación?' }).then(ok => {
      if (!ok) return;
      // call backend
      this.reservasService.delete(Number(id)).subscribe({
        next: () => {
          this.reservations = this.reservations.filter(r => r.id !== id);
          this.filterReservations();
          this.notification.show('Reservación eliminada', 'success');
        },
        error: err => {
            console.error('Error eliminando reservación', err);
            // Detect server-side forbidden (403) for confirmed reservations and show a friendly toast.
            let msg = 'Error al eliminar reservación';
            try {
              if (err && err.status === 403) {
                // err.error can be a string or an object with message
                if (err.error) {
                  msg = typeof err.error === 'string' ? err.error : (err.error.message ?? 'No se puede eliminar una reserva confirmada.');
                } else {
                  msg = 'No se puede eliminar una reserva confirmada.';
                }
              } else {
                msg = err?.error?.message ?? (typeof err?.error === 'string' ? err.error : err?.message) ?? msg;
              }
            } catch (e) {
              console.error('Error parsing deletion error', e);
            }
            this.notification.show(String(msg).substring(0, 140), 'error');
        }
      });
    });
  }

  onSubmit() {
    if (this.isSubmitting) return; // evitar doble envío
    if (!this.reservationForm.valid) return;

    const formData = this.reservationForm.value;

    const dtoCreate: any = {
      clienteId: Number(formData.clientId),
      mesaId: Number(formData.tableId),
      fechaHoraInicio: `${formData.date}T${formData.time}:00`,
      duracionMinutos: 60,
      cantidadPersonas: Number(formData.guests),
      nota: formData.notes || '',
      estado: this.mapStatusLabelToEstado(formData.status ?? 'Pendiente')
    } as CreateReservaDto;

    if (this.editingReservation) {
      const dtoUpdate: UpdateReservaDto = {
        mesaId: Number(formData.tableId),
        fechaHoraInicio: `${formData.date}T${formData.time}:00`,
        duracionMinutos: 60,
        cantidadPersonas: Number(formData.guests),
        nota: formData.notes || '',
        estado: this.mapStatusLabelToEstado(formData.status)
      };

      // evitar envíos múltiples al actualizar
      this.isSubmitting = true;
      this.reservasService.update(Number(this.editingReservation.id), dtoUpdate).subscribe({
        next: updated => {
          this.isSubmitting = false;
          const idx = this.reservations.findIndex(r => r.id === this.editingReservation!.id);
          if (idx !== -1) this.reservations[idx] = this.mapReservaToReservation(updated as Reserva);
          this.filterReservations();
          this.closeModal();
          this.notification.show('Reservación actualizada', 'success');
        },
        error: err => {
          this.isSubmitting = false;
          console.error('Error actualizando reservación', err);
          // Manejo específico para 409 (conflict) que devuelve {mensaje, codigo}
          if (err && err.status === 409) {
            const m = err.error && (err.error.mensaje || err.error.message) ? (err.error.mensaje || err.error.message) : 'Conflicto en la reservación';
            this.notification.show(String(m).substring(0, 140), 'error');
          } else {
            const msg = err?.error?.message || (typeof err?.error === 'string' ? err.error : err?.message) || 'Error actualizando reservación';
            this.notification.show(String(msg).substring(0, 140), 'error');
          }
        }
      });
    } else {
      // evitar envíos múltiples al crear
      this.isSubmitting = true;
      this.reservasService.create(dtoCreate).subscribe({
        next: created => {
          this.isSubmitting = false;
          this.reservations.unshift(this.mapReservaToReservation(created as Reserva));
          this.filterReservations();
          this.closeModal();
          this.notification.show('Reservación creada', 'success');
        },
        error: err => {
          this.isSubmitting = false;
          console.error('Error creando reservación', err);
          // Manejo específico para 409 (conflict) que devuelve {mensaje, codigo}
          if (err && err.status === 409) {
            const m = err.error && (err.error.mensaje || err.error.message) ? (err.error.mensaje || err.error.message) : 'Conflicto en la reservación';
            this.notification.show(String(m).substring(0, 140), 'error');
          } else {
            const msg = err?.error?.message || (typeof err?.error === 'string' ? err.error : err?.message) || 'Error creando reservación';
            this.notification.show(String(msg).substring(0, 140), 'error');
          }
        }
      });
    }
  }

  private mapReservaToReservation(r: Reserva): Reservation {
    // (debug removed)
    const dt = new Date(r.fechaHoraInicio);
    const date = dt.toISOString().split('T')[0];
    const time = dt.toTimeString().slice(0,5);

    // Cliente: preferir campos planos devueltos por ReservaResponseDto (clienteId/clienteNombre/clienteEmail/clientePhone)
    const clientId = (r as any).clienteId ? String((r as any).clienteId) : (r.cliente ? String((r.cliente as any).clienteId ?? (r.cliente as any).clientedId ?? (r.cliente as any).clienteId ?? '') : '');
    const clientName = (r as any).clienteNombre ?? ((r.cliente && ((r.cliente as any).nombre ?? (r.cliente as any).name)) || '');

    const guests = (r as any).cantidadPersonas ?? (r.duracionMinutos ? 1 : 1);

    const statusLabel = this.mapEstadoToLabel(r.estado ?? 'PENDIENTE');
    const estadoRaw = (r.estado ?? 'PENDIENTE').toString().toUpperCase();
    const statusClass = ((): string => {
      switch (estadoRaw) {
        case 'PENDIENTE': return 'pendiente';
        case 'CONFIRMADO':
        case 'CONFIRMADA': return 'confirmada';
        case 'EN_CURSO': return 'en-curso';
        case 'FINALIZADA': return 'finalizada';
        case 'CANCELADA': return 'cancelada';
        default: return estadoRaw.toLowerCase().replace(/\s+/g,'-');
      }
    })();

    // Map table name if we have it in availableTables
    // Defensive table id/name extraction: backend may return nested `mesa` object
    let tableId = '';
    if (r.mesaId && (typeof r.mesaId === 'string' || typeof r.mesaId === 'number')) {
      tableId = String(r.mesaId);
    } else if ((r as any).mesa && (((r as any).mesa as any).id || ((r as any).mesa as any).mesaId)) {
      tableId = String(((r as any).mesa as any).id ?? ((r as any).mesa as any).mesaId);
    } else {
      tableId = String((r as any).mesaId ?? '');
    }

    const tableObj = this.availableTables.find(t => t.id === tableId);

    // Prefer mesa object number (many possible shapes), then availableTables lookup, then fallbacks
    let tableName = '';

    const tryExtract = (v: any): string | null => {
      const s = this.extractString(v);
      return s && String(s).trim() ? String(s).trim() : null;
    };

    // Candidates to extract a mesa number/label from the reserva object
    const candidates = [
      (r as any).numeroMesa,
      (r as any).mesaNumero,
      (r as any).mesaId?.numeroMesa,
      (r as any).mesa?.numeroMesa,
      (r as any).mesa?.numneroMesa,
      (r as any).mesa?.numero,
      (r as any).mesa?.number,
      (r as any).mesaId?.mesaId,
      (r as any).mesa?.mesaId,
      (r as any).mesa?.id
    ];

    for (const c of candidates) {
      const s = tryExtract(c);
      if (s) {
        tableName = `Mesa ${s}`;
        break;
      }
    }

    // If not found via candidates, try to use availableTables lookup
    if (!tableName && tableObj) {
      const nameFromTable = tryExtract((tableObj as any).name) || tryExtract((tableObj as any).numero) || tryExtract((tableObj as any).id);
      if (nameFromTable) {
        // If the available table name already contains 'Mesa', keep it; otherwise prefix
        tableName = nameFromTable.toLowerCase().includes('mesa') ? nameFromTable : `Mesa ${nameFromTable}`;
      }
    }

    // As last resort, if r.mesa exists and is an object, try to extract any readable string from it
    if (!tableName && (r as any).mesa) {
      const fallback = tryExtract((r as any).mesa);
      if (fallback) {
        tableName = fallback.toLowerCase().includes('mesa') ? fallback : `Mesa ${fallback}`;
      }
    }

    if (!tableName && tableId) tableName = `Mesa ${tableId}`;
    tableName = String(tableName ?? '');

    const clientEmail = (r as any).clienteEmail ?? ((r.cliente && ((r.cliente as any).email ?? '')) || '');
    const clientPhone = (r as any).clientePhone ?? ((r.cliente && ((r.cliente as any).telefono ?? (r.cliente as any).phone ?? '')) || '');

    const mapped: Reservation = {
      id: String(r.reservaId),
      clientId: clientId,
      clientName: clientName,
      clientEmail: clientEmail,
      clientPhone: clientPhone,
      tableId: tableId,
      tableName: tableName,
      date: date,
      time: time,
      guests: Number(guests),
      status: statusLabel,
      statusClass: statusClass,
      notes: r.nota ?? '',
      createdAt: undefined
    } as Reservation;
    return mapped;
  }

  // Helper to extract a readable string from a value that might be a nested object
  private extractString(v: any, depth = 0): string {
    if (v === null || v === undefined) return '';
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (depth > 3) return '';
    if (typeof v === 'object') {
      // Common candidate keys
      const keys = ['nombre','name','numneroMesa','numeroMesa','numero','displayName','label','id','number','title'];
      for (const k of keys) {
        if ((v as any)[k] !== undefined && (typeof (v as any)[k] === 'string' || typeof (v as any)[k] === 'number')) {
          return String((v as any)[k]);
        }
        if ((v as any)[k] !== undefined) {
          const nested = this.extractString((v as any)[k], depth + 1);
          if (nested) return nested;
        }
      }
      // Try to inspect first string-like property
      for (const k of Object.keys(v)) {
        const nested = this.extractString((v as any)[k], depth + 1);
        if (nested) return nested;
      }
    }
    return '';
  }

  private mapEstadoToLabel(estado: string): string {
    if (!estado) return 'Pendiente';
    return humanizeEstadoReserva(estado);
  }

  private mapStatusLabelToEstado(label: string): string {
    if (!label) return 'PENDIENTE';
    const l = label.toLowerCase();
    switch (l) {
      case 'pendiente': return 'PENDIENTE';
      case 'confirmada': return 'CONFIRMADO';
      case 'cancelada': return 'CANCELADA';
      case 'completada': return 'FINALIZADA';
      default: return label.toUpperCase();
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Helper used only for debugging template output
  isObject(v: any): boolean {
    return v !== null && typeof v === 'object';
  }
}

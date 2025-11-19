import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Reservation } from '../../models/reservation.model';
import { Client } from '../../models/client.model';
import { Table } from '../../models/table.model';

@Component({
  selector: 'app-reservaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="reservaciones">
      <div class="page-header">
        <h2>Gestión de Reservaciones</h2>
        <button class="btn btn-primary" (click)="openModal()">
          <span class="btn-icon">➕</span>
          Nueva Reservación
        </button>
      </div>

      <div class="filters-section">
        <div class="filter-group">
          <label>Buscar:</label>
          <input
            type="text"
            [(ngModel)]="searchTerm"
            placeholder="Buscar por cliente, mesa o teléfono..."
            class="search-input"
          >
        </div>
        <div class="filter-group">
          <label>Estado:</label>
          <select [(ngModel)]="selectedStatus" class="filter-select">
            <option value="">Todos</option>
            <option value="Confirmada">Confirmada</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Cancelada">Cancelada</option>
            <option value="Completada">Completada</option>
          </select>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Mesa</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Personas</th>
              <th>Estado</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let reservation of filteredReservations">
              <td>
                <div class="client-info">
                  <div class="client-name">{{ reservation.clientName }}</div>
                  <div class="client-email">{{ reservation.clientEmail }}</div>
                </div>
              </td>
              <td>
                <span class="table-name">{{ reservation.tableName }}</span>
              </td>
              <td>{{ formatDate(reservation.date) }}</td>
              <td>{{ reservation.time }}</td>
              <td>
                <span class="guest-count">{{ reservation.guests }}</span>
              </td>
              <td>
                <span class="status-badge" [class]="'status-' + reservation.status.toLowerCase()">
                  {{ reservation.status }}
                </span>
              </td>
              <td>{{ reservation.clientPhone }}</td>
              <td>
                <div class="action-buttons">
                  <button
                    class="btn-action btn-edit"
                    (click)="editReservation(reservation)"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    class="btn-action btn-delete"
                    (click)="deleteReservation(reservation.id)"
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
            <h3>{{ editingReservation ? 'Editar' : 'Nueva' }} Reservación</h3>
            <button class="modal-close" (click)="closeModal()">✕</button>
          </div>

          <form [formGroup]="reservationForm" (ngSubmit)="onSubmit()" class="modal-form">
            <div class="form-row">
              <div class="form-group">
                <label>Cliente *</label>
                <select formControlName="clientId" class="form-control">
                  <option value="">Seleccionar cliente</option>
                  <option *ngFor="let client of clients" [value]="client.id">
                    {{ client.name }} - {{ client.phone }}
                  </option>
                </select>
                <div class="error-message" *ngIf="reservationForm.get('clientId')?.invalid && reservationForm.get('clientId')?.touched">
                  Cliente es requerido
                </div>
              </div>

              <div class="form-group">
                <label>Mesa *</label>
                <select formControlName="tableId" class="form-control">
                  <option value="">Seleccionar mesa</option>
                  <option *ngFor="let table of availableTables" [value]="table.id">
                    {{ table.name }} ({{ table.capacity }} personas)
                  </option>
                </select>
                <div class="error-message" *ngIf="reservationForm.get('tableId')?.invalid && reservationForm.get('tableId')?.touched">
                  Mesa es requerida
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Fecha *</label>
                <input
                  type="date"
                  formControlName="date"
                  class="form-control"
                  [min]="getTodayDate()"
                >
                <div class="error-message" *ngIf="reservationForm.get('date')?.invalid && reservationForm.get('date')?.touched">
                  Fecha es requerida
                </div>
              </div>

              <div class="form-group">
                <label>Hora *</label>
                <input
                  type="time"
                  formControlName="time"
                  class="form-control"
                >
                <div class="error-message" *ngIf="reservationForm.get('time')?.invalid && reservationForm.get('time')?.touched">
                  Hora es requerida
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Número de Personas *</label>
                <input
                  type="number"
                  formControlName="guests"
                  class="form-control"
                  min="1"
                  max="20"
                >
                <div class="error-message" *ngIf="reservationForm.get('guests')?.invalid && reservationForm.get('guests')?.touched">
                  Número de personas debe ser entre 1 y 20
                </div>
              </div>

              <div class="form-group" *ngIf="editingReservation">
                <label>Estado</label>
                <select formControlName="status" class="form-control">
                  <option value="Pendiente">Pendiente</option>
                  <option value="Confirmada">Confirmada</option>
                  <option value="Cancelada">Cancelada</option>
                  <option value="Completada">Completada</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Notas</label>
              <textarea
                formControlName="notes"
                class="form-control"
                rows="3"
                placeholder="Notas adicionales (opcional)"
              ></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">
                Cancelar
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="reservationForm.invalid"
              >
                {{ editingReservation ? 'Actualizar' : 'Crear' }} Reservación
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [``]
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

  constructor(private fb: FormBuilder) {
    this.reservationForm = this.fb.group({
      clientId: ['', Validators.required],
      tableId: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      guests: [2, [Validators.required, Validators.min(1), Validators.max(20)]],
      status: ['Pendiente'],
      notes: ['']
    });
  }

  ngOnInit() {
    this.loadMockData();
    this.filterReservations();
  }

  private loadMockData() {
    this.clients = [
      { id: '1', name: 'Juan Pérez', email: 'juan@email.com', phone: '555-0101', createdAt: new Date(), totalReservations: 5 },
      { id: '2', name: 'María García', email: 'maria@email.com', phone: '555-0102', createdAt: new Date(), totalReservations: 3 },
      { id: '3', name: 'Carlos López', email: 'carlos@email.com', phone: '555-0103', createdAt: new Date(), totalReservations: 7 }
    ];

    this.availableTables = [
      { id: '1', name: 'Mesa 1', capacity: 4, status: 'Disponible', location: 'Terraza', createdAt: new Date() },
      { id: '2', name: 'Mesa 2', capacity: 2, status: 'Disponible', location: 'Interior', createdAt: new Date() },
      { id: '3', name: 'Mesa 3', capacity: 6, status: 'Disponible', location: 'Interior', createdAt: new Date() }
    ];

    this.reservations = [
      { id: '1', clientId: '1', clientName: 'Juan Pérez', clientEmail: 'juan@email.com', clientPhone: '555-0101', tableId: '1', tableName: 'Mesa 1', date: '2025-01-15', time: '19:00', guests: 4, status: 'Confirmada', notes: 'Celebración de cumpleaños', createdAt: new Date() },
      { id: '2', clientId: '2', clientName: 'María García', clientEmail: 'maria@email.com', clientPhone: '555-0102', tableId: '2', tableName: 'Mesa 2', date: '2025-01-16', time: '20:30', guests: 2, status: 'Pendiente', createdAt: new Date() }
    ];
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
  }

  closeModal() {
    this.showModal = false;
    this.editingReservation = null;
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
  }

  deleteReservation(id: string) {
    if (confirm('¿Está seguro de eliminar esta reservación?')) {
      this.reservations = this.reservations.filter(r => r.id !== id);
      this.filterReservations();
    }
  }

  onSubmit() {
    if (this.reservationForm.valid) {
      const formData = this.reservationForm.value;
      const selectedClient = this.clients.find(c => c.id === formData.clientId);
      const selectedTable = this.availableTables.find(t => t.id === formData.tableId);

      if (this.editingReservation) {
        const index = this.reservations.findIndex(r => r.id === this.editingReservation!.id);
        this.reservations[index] = {
          ...this.editingReservation,
          ...formData,
          clientName: selectedClient?.name || '',
          clientEmail: selectedClient?.email || '',
          clientPhone: selectedClient?.phone || '',
          tableName: selectedTable?.name || ''
        } as Reservation;
      } else {
        const newReservation: Reservation = {
          id: Date.now().toString(),
          ...formData,
          clientName: selectedClient?.name || '',
          clientEmail: selectedClient?.email || '',
          clientPhone: selectedClient?.phone || '',
          tableName: selectedTable?.name || '',
          createdAt: new Date()
        } as Reservation;
        this.reservations.push(newReservation);
      }

      this.filterReservations();
      this.closeModal();
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Client, CreateClientRequest } from '../../models/client.model';

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
                    class="btn-action btn-delete"
                    (click)="deleteClient(client.id)"
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
            <h3>{{ editingClient ? 'Editar' : 'Nuevo' }} Cliente</h3>
            <button class="modal-close" (click)="closeModal()">✕</button>
          </div>

          <form [formGroup]="clientForm" (ngSubmit)="onSubmit()" class="modal-form">
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
  styles: [``]
})
export class ClientesComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  searchTerm = '';
  showModal = false;
  editingClient: Client | null = null;

  clientForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['']
    });
  }

  ngOnInit() {
    this.loadMockData();
    this.filterClients();
  }

  private loadMockData() {
    this.clients = [
      { id: '1', name: 'Juan Pérez García', email: 'juan.perez@email.com', phone: '555-0101', address: 'Av. Principal 123, Colonia Centro', createdAt: new Date('2024-01-15'), totalReservations: 12 },
      { id: '2', name: 'María Elena García', email: 'maria.garcia@email.com', phone: '555-0102', address: 'Calle Secundaria 456, Zona Norte', createdAt: new Date('2024-02-20'), totalReservations: 8 },
      { id: '3', name: 'Carlos López Mendoza', email: 'carlos.lopez@email.com', phone: '555-0103', createdAt: new Date('2024-03-10'), totalReservations: 15 },
      { id: '4', name: 'Ana Sofía Rodríguez', email: 'ana.rodriguez@email.com', phone: '555-0104', address: 'Plaza Mayor 789, Centro Histórico', createdAt: new Date('2024-04-05'), totalReservations: 6 },
      { id: '5', name: 'Roberto Martínez', email: 'roberto.martinez@email.com', phone: '555-0105', address: 'Paseo de la Reforma 321, Zona Rosa', createdAt: new Date('2024-05-12'), totalReservations: 9 }
    ];
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

  deleteClient(id: string) {
    if (confirm('¿Está seguro de eliminar este cliente? Esta acción no se puede deshacer.')) {
      this.clients = this.clients.filter(c => c.id !== id);
      this.filterClients();
    }
  }

  onSubmit() {
    if (this.clientForm.valid) {
      const formData = this.clientForm.value as CreateClientRequest;

      if (this.editingClient) {
        const index = this.clients.findIndex(c => c.id === this.editingClient!.id);
        this.clients[index] = {
          ...this.editingClient,
          ...formData
        } as Client;
      } else {
        const newClient: Client = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date(),
          totalReservations: 0
        };
        this.clients.push(newClient);
      }

      this.filterClients();
      this.closeModal();
    }
  }

  formatDate(date?: Date): string {
    return date ? date.toLocaleDateString('es-ES') : '';
  }
}

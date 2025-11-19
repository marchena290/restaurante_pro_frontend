import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from '../../models/table.model';

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
              <label>Nombre de la Mesa *</label>
              <input
                type="text"
                formControlName="name"
                class="form-control"
                placeholder="Ej: Mesa 1, Mesa VIP A, Terraza 3"
              >
              <div class="error-message" *ngIf="tableForm.get('name')?.invalid && tableForm.get('name')?.touched">
                Nombre es requerido
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
  styles: [``]
})
export class MesasComponent implements OnInit {
  tables: Table[] = [];
  filteredTables: Table[] = [];
  searchTerm = '';
  selectedStatus = '';
  showModal = false;
  editingTable: Table | null = null;

  tableForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.tableForm = this.fb.group({
      name: ['', Validators.required],
      capacity: [4, [Validators.required, Validators.min(1), Validators.max(20)]],
      location: ['', Validators.required],
      status: ['Disponible']
    });
  }

  ngOnInit() {
    this.loadMockData();
    this.filterTables();
  }

  private loadMockData() {
    this.tables = [
      { id: '1', name: 'Mesa 1', capacity: 4, status: 'Disponible', location: 'Interior', createdAt: new Date('2024-01-15') },
      { id: '2', name: 'Mesa 2', capacity: 2, status: 'Ocupada', location: 'Terraza', createdAt: new Date('2024-01-15') },
      { id: '3', name: 'Mesa 3', capacity: 6, status: 'Reservada', location: 'Interior', createdAt: new Date('2024-01-15') },
      { id: '4', name: 'Mesa VIP A', capacity: 8, status: 'Disponible', location: 'Área VIP', createdAt: new Date('2024-01-16') },
      { id: '5', name: 'Barra 1', capacity: 2, status: 'Ocupada', location: 'Barra', createdAt: new Date('2024-01-16') },
      { id: '6', name: 'Terraza 1', capacity: 6, status: 'Disponible', location: 'Terraza', createdAt: new Date('2024-01-16') },
      { id: '7', name: 'Mesa 7', capacity: 4, status: 'Mantenimiento', location: 'Interior', createdAt: new Date('2024-01-17') },
      { id: '8', name: 'Patio 1', capacity: 10, status: 'Disponible', location: 'Patio', createdAt: new Date('2024-01-17') }
    ];
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
    if (index !== -1) {
      this.tables[index].status = newStatus as any;
      this.filterTables();
    }
  }

  openModal() {
    this.showModal = true;
    this.editingTable = null;
    this.tableForm.reset({ capacity: 4, status: 'Disponible' });
  }

  closeModal() {
    this.showModal = false;
    this.editingTable = null;
  }

  editTable(table: Table) {
    this.editingTable = table;
    this.showModal = true;

    this.tableForm.patchValue({
      name: table.name,
      capacity: table.capacity,
      location: table.location,
      status: table.status
    });
  }

  deleteTable(id: string) {
    if (confirm('¿Está seguro de eliminar esta mesa? Esta acción no se puede deshacer.')) {
      this.tables = this.tables.filter(t => t.id !== id);
      this.filterTables();
    }
  }

  onSubmit() {
    if (this.tableForm.valid) {
      const formData = this.tableForm.value;

      if (this.editingTable) {
        const index = this.tables.findIndex(t => t.id === this.editingTable!.id);
        this.tables[index] = { ...this.editingTable, ...formData } as Table;
      } else {
        const newTable: Table = { id: Date.now().toString(), ...formData, createdAt: new Date() };
        this.tables.push(newTable);
      }

      this.filterTables();
      this.closeModal();
    }
  }

  formatDate(date?: Date): string {
    return date ? date.toLocaleDateString('es-ES') : '';
  }
}

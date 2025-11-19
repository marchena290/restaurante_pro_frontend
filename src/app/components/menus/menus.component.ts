import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Menu } from '../../models/menu.model';

@Component({
  selector: 'app-menus',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="menus">
      <div class="page-header">
        <h2>Gestión de Menús</h2>
        <button class="btn btn-primary" (click)="openModal()">
          <span class="btn-icon">➕</span>
          Nuevo Menú
        </button>
      </div>

      <div class="filters-section">
        <div class="filter-group">
          <label>Buscar:</label>
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (ngModelChange)="filterMenus()"
            placeholder="Buscar por nombre o descripción..."
            class="search-input"
          >
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let menu of filteredMenus">
              <td>
                <span class="menu-id">{{ menu.id }}</span>
              </td>
              <td>
                <div class="menu-name">
                  <span class="name-badge">🍽️</span>
                  <span>{{ menu.name }}</span>
                </div>
              </td>
              <td>
                <span class="menu-description">{{ menu.description || 'Sin descripción' }}</span>
              </td>
              <td>
                <span class="menu-price">\${{ menu.price.toFixed(2) }}</span>
              </td>
              <td>
                <div class="action-buttons">
                  <button
                    class="btn-action btn-edit"
                    (click)="editMenu(menu)"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    class="btn-action btn-delete"
                    (click)="deleteMenu(menu.id)"
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
            <h3>{{ editingMenu ? 'Editar' : 'Nuevo' }} Menú</h3>
            <button class="modal-close" (click)="closeModal()">✕</button>
          </div>

          <form [formGroup]="menuForm" (ngSubmit)="onSubmit()" class="modal-form">
            <div class="form-group">
              <label>Nombre *</label>
              <input
                type="text"
                formControlName="name"
                class="form-control"
                placeholder="Ej: Hamburguesa Clásica, Ensalada César"
              >
              <div class="error-message" *ngIf="menuForm.get('name')?.invalid && menuForm.get('name')?.touched">
                Nombre es requerido
              </div>
            </div>

            <div class="form-group">
              <label>Descripción *</label>
              <textarea
                formControlName="description"
                class="form-control"
                rows="4"
                placeholder="Describe los ingredientes y características del platillo..."
              ></textarea>
              <div class="error-message" *ngIf="menuForm.get('description')?.invalid && menuForm.get('description')?.touched">
                Descripción es requerida
              </div>
            </div>

            <div class="form-group">
              <label>Precio *</label>
              <div class="price-input-wrapper">
                <span class="currency-symbol">$</span>
                <input
                  type="number"
                  formControlName="price"
                  class="form-control price-input"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                >
              </div>
              <div class="error-message" *ngIf="menuForm.get('price')?.invalid && menuForm.get('price')?.touched">
                <span *ngIf="menuForm.get('price')?.errors?.['required']">Precio es requerido</span>
                <span *ngIf="menuForm.get('price')?.errors?.['min']">El precio debe ser mayor a 0</span>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">
                Cancelar
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="menuForm.invalid"
              >
                {{ editingMenu ? 'Actualizar' : 'Crear' }} Menú
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [``]
})
export class MenusComponent implements OnInit {
  menus: Menu[] = [];
  filteredMenus: Menu[] = [];
  searchTerm = '';
  showModal = false;
  editingMenu: Menu | null = null;

  menuForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.menuForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit() {
    this.loadMockData();
    this.filterMenus();
  }

  private loadMockData() {
    this.menus = [
      { id: '1', name: 'Hamburguesa Clásica', description: 'Jugosa hamburguesa...', price: 12.99, createdAt: new Date('2024-01-15') },
      { id: '2', name: 'Ensalada César', description: 'Lechuga romana fresca...', price: 9.5, createdAt: new Date('2024-01-16') },
      { id: '3', name: 'Pizza Margherita', description: 'Pizza artesanal...', price: 14.99, createdAt: new Date('2024-01-17') }
    ];
  }

  filterMenus() {
    if (!this.searchTerm) {
      this.filteredMenus = [...this.menus];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredMenus = this.menus.filter(menu =>
        menu.name.toLowerCase().includes(term) ||
        (menu.description || '').toLowerCase().includes(term)
      );
    }
  }

  openModal() {
    this.showModal = true;
    this.editingMenu = null;
    this.menuForm.reset({ price: 0 });
  }

  closeModal() {
    this.showModal = false;
    this.editingMenu = null;
  }

  editMenu(menu: Menu) {
    this.editingMenu = menu;
    this.showModal = true;
    this.menuForm.patchValue({ name: menu.name, description: menu.description, price: menu.price });
  }

  deleteMenu(id: string) {
    if (confirm('¿Está seguro de eliminar este menú? Esta acción no se puede deshacer.')) {
      this.menus = this.menus.filter(m => m.id !== id);
      this.filterMenus();
    }
  }

  onSubmit() {
    if (this.menuForm.valid) {
      const formData = this.menuForm.value;

      if (this.editingMenu) {
        const index = this.menus.findIndex(m => m.id === this.editingMenu!.id);
        this.menus[index] = { ...this.editingMenu, ...formData } as Menu;
      } else {
        const newMenu: Menu = { id: Date.now().toString(), ...formData, createdAt: new Date() };
        this.menus.push(newMenu);
      }

      this.filterMenus();
      this.closeModal();
    }
  }
}

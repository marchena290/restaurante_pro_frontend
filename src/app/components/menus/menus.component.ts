import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Menu, CreateMenuItemDto, UpdateMenuItemDto } from '../../models/menu.model';
import { MenusService } from '../../services/menus.service';
import { NotificationService } from '../../services/notification.service';
import { ConfirmService } from '../../services/confirm.service';

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
              <th class="col-price">Precio</th>
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
              <td class="col-price">
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
            <h3>{{ editingMenu ? '✏️ Editar' : '➕ Nuevo' }} Menú</h3>
            <button class="modal-close" (click)="closeModal()">✕</button>
          </div>

          <form [formGroup]="menuForm" (ngSubmit)="onSubmit()" class="modal-form">
            <div class="modal-body">
              <div class="form-row">
                <label class="form-label">Nombre</label>
                <input type="text" formControlName="name" class="form-control" placeholder="Ej: Hamburguesa Clásica" autofocus>
                <div class="error-message" *ngIf="menuForm.get('name')?.invalid && menuForm.get('name')?.touched">Nombre es requerido</div>
              </div>

              <div class="form-row description-row">
                <label class="form-label">Descripción</label>
                <textarea formControlName="description" class="form-control" rows="2" placeholder="Ingredientes y descripción"></textarea>
                <div class="error-message" *ngIf="menuForm.get('description')?.invalid && menuForm.get('description')?.touched">Descripción es requerida</div>
              </div>

              <div class="form-row small-row">
                <label class="form-label"><span class="currency-symbol">$</span> Precio</label>
                <input type="number" formControlName="price" class="form-control price-input" min="0" step="0.01" placeholder="0.00">
                <div class="error-message" *ngIf="menuForm.get('price')?.invalid && menuForm.get('price')?.touched">
                  <span *ngIf="menuForm.get('price')?.errors?.['required']">Precio es requerido</span>
                  <span *ngIf="menuForm.get('price')?.errors?.['min']">El precio debe ser mayor a 0</span>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeModal()" [disabled]="saving">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="menuForm.invalid || saving">
                <span *ngIf="saving" class="spinner">⏳</span>
                <span *ngIf="!saving">{{ editingMenu ? 'Actualizar' : 'Crear' }} Menú</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    /* Page layout */
    .menus { padding: 20px; min-height: 100%; background: #f8fafc; }

    .page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px }
    .page-header h2 { margin:0; font-size:1.5rem; font-weight:700; color:#0f172a }

    .filters-section { background:white; padding:12px; border-radius:10px; box-shadow:0 1px 3px rgba(2,6,23,0.04); margin-bottom:16px }

    /* Table container like clientes */
    .table-container { background:white; border-radius:12px; box-shadow:0 1px 3px rgba(2,6,23,0.04); overflow:hidden }
    .data-table { width:100%; border-collapse:collapse; table-layout:fixed }
    .data-table th, .data-table td { padding:12px 16px; text-align:left }
    /* Define fixed column widths so header and values align predictably */
    .data-table col.col-id { width:60px }
    .data-table col.col-name { width: auto }
    .data-table col.col-desc { width: calc(100% - 60px - 160px - 120px) }
    .data-table col.col-price { width:160px }
    .data-table col.col-actions { width:120px }
    /* Keep the header and cells for Precio aligned with consistent padding */
    .data-table th.col-price, .data-table td.col-price { text-align:right; padding-right:28px }
    .menu-price { display:block; width:100%; text-align:right }
    /* ensure action buttons stay in their own column and won't overlap the price */
    .data-table td.col-actions { text-align:left; padding-left:12px }
    .menu-price { display:block; width:100%; text-align:right }
    .data-table tbody tr { transition:background .12s ease }
    .data-table tbody tr:hover { background:#fbfdff }
    .data-table td .menu-price { display:block; text-align:right; font-weight:600 }

    /* Actions */
    .action-buttons { display:flex; gap:8px }
    .btn-action { background:transparent; border:none; cursor:pointer; padding:6px; border-radius:8px }
    .btn-action:hover { background:#f1f5f9 }

    /* Modal styles copied from clientes for consistency */
    .modal-overlay { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(2,6,23,0.45); z-index:2000; padding:20px }
    .modal-content { background:var(--white,#fff); border-radius:12px; width:100%; max-width:560px; max-height:90vh; overflow-y:auto; box-shadow:0 24px 48px rgba(2,6,23,0.12) }
    .modal-header { padding:14px 18px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #f1f5f9 }
    .modal-header h3 { margin:0; font-size:1.05rem; font-weight:700; color:#0f172a }
    .modal-close { background:transparent; border:none; font-size:1.05rem; color:#475569; padding:6px; border-radius:6px; cursor:pointer }
    .modal-close:hover { background:#f1f5f9 }

    .modal-form { padding:14px 18px 20px }
    .form-row { display:grid; grid-template-columns:1fr; gap:12px }
    .form-row.small-row { grid-template-columns:120px 1fr; align-items:center; gap:16px }
    .form-row.description-row { margin-bottom:12px; margin-top:14px }
    .price-input { max-width:140px }
    .action-buttons { gap:12px }
    .modal-actions { margin-top:18px }
    .form-group { display:flex; flex-direction:column; gap:8px; margin-bottom:12px }

    .form-control { padding:10px 12px; border:1px solid #e6eefb; border-radius:8px; font-size:0.95rem; background:#fbfdff; transition:box-shadow .12s ease, border-color .12s ease }
    .form-control:focus { outline:none; box-shadow:0 6px 18px rgba(59,130,246,0.12); border-color:#3b82f6 }

    .error-message { color:#dc2626; font-size:0.85rem }

    .modal-actions { display:flex; justify-content:flex-end; gap:10px; margin-top:8px; padding-top:10px; border-top:1px solid #f8fafc }
    .btn { padding:8px 12px; border-radius:8px; font-weight:600; border:none; cursor:pointer }
    .btn-primary { background:#2563eb; color:#fff; min-width:120px }
    .btn-primary:hover { filter:brightness(.95) }
    .btn-secondary { background:#f3f4f6; color:#0f172a }
    .btn:disabled { opacity:.6; cursor:not-allowed }

    /* small helpers */
    .currency-symbol { margin-right:8px }
    .spinner { margin-right:6px }

    @media (max-width: 640px) { .form-row { grid-template-columns:1fr } .modal-content { margin:10px; max-width:100% } }
    `
  ]
})
export class MenusComponent implements OnInit {
  menus: Menu[] = [];
  filteredMenus: Menu[] = [];
  searchTerm = '';
  showModal = false;
  editingMenu: Menu | null = null;
  saving = false;

  menuForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private menusService: MenusService,
    private notification: NotificationService,
    private confirm: ConfirmService
  ) {
    this.menuForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit() {
    this.loadMenus();
  }

  private loadMenus() {
    this.menusService.list().subscribe({
      next: menus => {
        // ensure ids are strings for consistent handling
        this.menus = menus.map(m => ({ ...m, id: String((m as any).id) } as Menu));
        this.filterMenus();
      },
      error: err => {
        console.error('Error cargando menús', err);
        this.notification.show('No se pudieron cargar los menús', 'error');
      }
    });
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
    // Small UX: mark untouched/pristine so errors don't show immediately
    this.menuForm.markAsPristine();
    this.menuForm.markAsUntouched();
  }

  closeModal() {
    this.showModal = false;
    this.editingMenu = null;
  }

  editMenu(menu: Menu) {
    this.editingMenu = menu;
    this.showModal = true;
    this.menuForm.patchValue({ name: menu.name, description: menu.description, price: menu.price });
    this.menuForm.markAsPristine();
    this.menuForm.markAsUntouched();
  }

  async deleteMenu(id: string) {
    const ok = await this.confirm.confirm({ title: 'Eliminar menú', message: '¿Está seguro de eliminar este menú?' });
    if (!ok) return;

    this.menusService.delete(id).subscribe({
      next: () => {
        this.menus = this.menus.filter(m => String(m.id) !== String(id));
        this.filterMenus();
        this.notification.show('Menú eliminado', 'success');
      },
      error: err => {
        console.error('Error eliminando menú', err);
        const msg = err?.error?.message || err?.message || 'Error eliminando menú';
        this.notification.show(msg.substring(0, 120), 'error');
      }
    });
  }

  onSubmit() {
    if (this.menuForm.invalid) return;

    const formData: CreateMenuItemDto | UpdateMenuItemDto = this.menuForm.value;
    this.saving = true;

    if (this.editingMenu) {
      const id = this.editingMenu.id;
      this.menusService.update(id, formData).subscribe({
        next: updated => {
          const idx = this.menus.findIndex(m => String(m.id) === String(id));
          if (idx !== -1) this.menus[idx] = { ...updated, id: String((updated as any).id) } as Menu;
          this.filterMenus();
          this.closeModal();
          this.notification.show('Menú actualizado', 'success');
          this.saving = false;
        },
        error: err => {
          console.error('Error actualizando menú', err);
          const msg = err?.error?.message || err?.message || 'Error actualizando menú';
          this.notification.show(msg.substring(0, 120), 'error');
          this.saving = false;
        }
      });
    } else {
      this.menusService.create(formData as CreateMenuItemDto).subscribe({
        next: created => {
          // ensure price is a number and format if necessary
          const item = { ...created, id: String((created as any).id), price: Number((created as any).precio ?? created.price ?? 0) } as Menu;
          this.menus.unshift(item);
          this.filterMenus();
          this.closeModal();
          this.notification.show('Menú creado', 'success');
          this.saving = false;
        },
        error: err => {
          console.error('Error creando menú', err);
          const msg = err?.error?.message || err?.message || 'Error creando menú';
          this.notification.show(msg.substring(0, 120), 'error');
          this.saving = false;
        }
      });
    }
  }
}

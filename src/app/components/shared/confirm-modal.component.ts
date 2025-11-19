import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="confirm-overlay" (click)="$event.stopPropagation()">
      <div class="confirm-card" (click)="$event.stopPropagation()">
        <div class="confirm-header">
          <h3>{{ title }}</h3>
        </div>
        <div class="confirm-body">
          <p [innerHTML]="message"></p>
        </div>
        <div class="confirm-actions">
          <button class="btn btn-secondary" (click)="onCancel()">{{ cancelLabel }}</button>
          <button class="btn btn-primary" (click)="onConfirm()">{{ confirmLabel }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .confirm-overlay {
      position: fixed;
      inset: 0;
      display:flex;
      align-items:center;
      justify-content:center;
      background: rgba(0,0,0,0.48);
      z-index: 99999;
      padding: 20px;
    }
    .confirm-card {
      width: 420px;
      max-width: 100%;
      background: white;
      border-radius: 12px;
      box-shadow: 0 16px 40px rgba(2,6,23,0.18);
      padding: 18px;
      color: #0f172a;
    }
    .confirm-header h3 { margin:0 0 8px 0; font-size:1.125rem; }
    .confirm-body p { margin:0 0 12px 0; color:#334155; }
    .confirm-actions { display:flex; gap:10px; justify-content:flex-end; }
    .btn { padding:8px 12px; border-radius:8px; font-weight:600; border:none; cursor:pointer; }
    .btn-primary { background: #ef4444; color:white; }
    .btn-secondary { background:#f3f4f6; color:#0f172a; }
    `
  ]
})
export class ConfirmModalComponent {
  @Input() title = 'Confirmar';
  @Input() message = '¿Estás seguro?';
  @Input() confirmLabel = 'Confirmar';
  @Input() cancelLabel = 'Cancelar';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() { this.confirm.emit(); }
  onCancel() { this.cancel.emit(); }
}

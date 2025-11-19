import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MesasMockService } from '../services/mesas.mock.service';
import { Mesa } from '../models/mesa.model';

@Component({
  standalone: true,
  selector: 'app-mesas-demo',
  imports: [CommonModule],
  template: `
    <div style="padding:16px; max-width:800px; margin:auto;">
      <h2>Demo: Mesas (mock)</h2>
      <button (click)="reload()">Recargar</button>
      <table style="width:100%; margin-top:12px; border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left; border-bottom:1px solid #ddd; padding:6px">ID</th>
            <th style="text-align:left; border-bottom:1px solid #ddd; padding:6px">Número</th>
            <th style="text-align:left; border-bottom:1px solid #ddd; padding:6px">Capacidad</th>
            <th style="text-align:left; border-bottom:1px solid #ddd; padding:6px">Ubicación</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let m of mesas">
            <td style="padding:6px">{{m.mesaId}}</td>
            <td style="padding:6px">{{m.numero}}</td>
            <td style="padding:6px">{{m.capacidad}}</td>
            <td style="padding:6px">{{m.ubicacion}}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class MesasDemoComponent implements OnInit {
  mesas: Mesa[] = [];

  constructor(private mesasMock: MesasMockService) {}

  ngOnInit(): void {
    this.reload();
  }

  reload() {
    this.mesasMock.list().subscribe(data => this.mesas = data);
  }
}

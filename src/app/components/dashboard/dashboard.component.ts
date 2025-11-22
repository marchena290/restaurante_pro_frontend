import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { MesasService } from '../../services/mesas.service';
import { ReservacionesService } from '../../services/reservaciones.service';

interface DashboardStats {
  totalReservations: number;
  todayReservations: number;
  occupiedTables: number;
  totalTables: number;
  activeClients: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <div class="welcome-section">
        <h2>¡Bienvenido, {{ currentUser?.name }}!</h2>
        <p>Aquí tienes un resumen del estado actual del restaurante</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <h3>Reservas del Día</h3>
            <div class="stat-number">{{ stats.todayReservations }}</div>
            <div class="stat-subtitle">de {{ stats.totalReservations }} totales</div>
          </div>
        </div>

        <div class="stat-card success">
          <div class="stat-icon">🪑</div>
          <div class="stat-content">
            <h3>Mesas Ocupadas</h3>
            <div class="stat-number">{{ stats.occupiedTables }}/{{ stats.totalTables }}</div>
            <div class="stat-subtitle">{{ getOccupancyPercentage() }}% ocupación</div>
          </div>
        </div>

        <div class="stat-card warning">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>Clientes Activos</h3>
            <div class="stat-number">{{ stats.activeClients }}</div>
            <div class="stat-subtitle">este mes</div>
          </div>
        </div>
      </div>

      <div class="charts-section">
        <div class="chart-card">
          <h3>Reservas por Semana</h3>
          <div class="bar-chart">
            <div class="bar-chart-container">
              <div *ngFor="let day of weeklyData" class="bar-item">
                <div class="bar" [style.height.%]="day.percentage"></div>
                <div class="bar-label">{{ day.day }}</div>
                <div class="bar-value">{{ day.reservations }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-card">
          <h3>Estado de las Mesas</h3>
          <div class="table-status-grid">
            <div *ngFor="let table of tableStatus"
                 [ngClass]="['table-item', getTableStatusClass(table.status)]">
              <div class="table-number">Mesa {{ table.number }}</div>
              <div class="table-status">{{ table.status }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="recent-activity">
        <div class="activity-card">
          <h3>Actividad Reciente</h3>
          <div class="activity-list">
            <div *ngFor="let activity of recentActivity" class="activity-item">
              <div class="activity-icon">{{ activity.icon }}</div>
              <div class="activity-content">
                <div class="activity-text">{{ activity.text }}</div>
                <div class="activity-time">{{ activity.time }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    /* Only center the stats grid so the three cards appear centered
       Keep other global/container styles untouched to avoid layout shifts */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(220px, 1fr));
      gap: 1rem;
      justify-content: center; /* center the grid within its parent */
      align-items: start;
      margin: 0 auto 1.5rem;
      max-width: 900px;
      width: 100%;
    }

    @media (max-width: 900px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); max-width: 700px; }
    }

    @media (max-width: 600px) {
      .stats-grid { grid-template-columns: 1fr; max-width: 420px; }
    }
    `
  ]
})
export class DashboardComponent implements OnInit {
  currentUser: any = null;

  stats: DashboardStats = {
    totalReservations: 145,
    todayReservations: 23,
    occupiedTables: 8,
    totalTables: 12,
    activeClients: 89,
  };

  weeklyData = [
    { day: 'Lun', reservations: 15, percentage: 60 },
    { day: 'Mar', reservations: 22, percentage: 88 },
    { day: 'Mié', reservations: 18, percentage: 72 },
    { day: 'Jue', reservations: 25, percentage: 100 },
    { day: 'Vie', reservations: 28, percentage: 112 },
    { day: 'Sáb', reservations: 32, percentage: 128 },
    { day: 'Dom', reservations: 20, percentage: 80 }
  ];

  tableStatus = [
    { number: 1, status: 'Disponible' },
    { number: 2, status: 'Ocupada' },
    { number: 3, status: 'Reservada' },
    { number: 4, status: 'Disponible' },
    { number: 5, status: 'Ocupada' },
    { number: 6, status: 'Disponible' },
    { number: 7, status: 'Ocupada' },
    { number: 8, status: 'Reservada' },
  ];

  recentActivity = [
    { icon: '✅', text: 'Nueva reserva confirmada para Mesa 5', time: 'Hace 5 minutos' },
    { icon: '👥', text: 'Cliente nuevo registrado: María García', time: 'Hace 15 minutos' },
    { icon: '🪑', text: 'Mesa 3 liberada y lista para nueva reserva', time: 'Hace 30 minutos' },
    { icon: '📞', text: 'Llamada perdida de cliente para reserva', time: 'Hace 1 hora' }
  ];

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private mesasService: MesasService,
    private reservasService: ReservacionesService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    // Try to fetch real stats from backend; fall back to the mock values if any call fails
    this.dashboardFetchStats();
  }

  private dashboardFetchStats() {
    // reservas por 7 dias
    try {
      this.dashboardService.getReservasStats(7).subscribe({
        next: stats => {
          if (Array.isArray(stats) && stats.length) {
            // Ensure stats are ordered by date ascending (start -> today)
            stats.sort((a,b) => (a.date || '').localeCompare(b.date || ''));

            // compute totals and weeklyData
            this.stats.totalReservations = stats.reduce((s, it) => s + (it.count ?? 0), 0);
            // today's count is the last element after sorting
            this.stats.todayReservations = stats.length ? (stats[stats.length - 1].count ?? this.stats.todayReservations) : this.stats.todayReservations;

            const maxCount = Math.max(1, ...stats.map(s => s.count ?? 0));
            this.weeklyData = stats.map(it => ({
              day: this.formatDateLabel(it.date),
              reservations: it.count ?? 0,
              percentage: Math.round(((it.count ?? 0) / maxCount) * 100)
            }));
          }
        },
        error: () => { /* keep mock */ }
      });

      // mesas ocupadas
      this.dashboardService.getMesasOcupadas().subscribe({
        next: m => {
          if (m) {
            if (typeof m === 'number') {
              this.stats.occupiedTables = m;
            } else {
              this.stats.occupiedTables = m.occupied ?? this.stats.occupiedTables;
              this.stats.totalTables = m.total ?? this.stats.totalTables;
            }
          }
        },
        error: () => {}
      });

      // fetch detailed mesas to show per-table status
      this.mesasService.list().subscribe({
        next: mesas => {
          if (Array.isArray(mesas)) {
            this.tableStatus = mesas.map(m => ({
              number: (m as any).numeroMesa ?? (m as any).mesaId ?? (m as any).id ?? '',
              status: (m as any).estado ?? (m as any).status ?? 'Disponible'
            }));
            // also update totals from mesas list if not provided by /ocupadas
            this.stats.totalTables = mesas.length;
            this.stats.occupiedTables = mesas.filter((m: any) => (m.estado ?? m.status ?? 'DISPONIBLE').toString().toLowerCase() !== 'disponible').length;
          }
        },
        error: () => {}
      });

      // clientes activos
      this.dashboardService.getClientesActivos(30).subscribe({
        next: c => {
          if (c !== null && c !== undefined) {
            if (typeof c === 'number') {
              this.stats.activeClients = c;
            } else {
              this.stats.activeClients = (c.active ?? this.stats.activeClients) as number;
            }
          }
        },
        error: () => {}
      });

      // recent activity: derive from latest reservations
      this.reservasService.list().subscribe({
        next: reservas => {
          if (Array.isArray(reservas)) {
            const sorted = reservas.slice().sort((a: any, b: any) => {
              const ta = a.fechaHoraInicio ? new Date(a.fechaHoraInicio).getTime() : 0;
              const tb = b.fechaHoraInicio ? new Date(b.fechaHoraInicio).getTime() : 0;
              return tb - ta;
            });
            this.recentActivity = sorted.slice(0, 6).map((r: any) => {
              const clienteName = (r.cliente && (r.cliente.nombre ?? r.cliente.name)) ?? (r.clienteNombre ?? 'Cliente');
              const mesaNum = (r.mesa && (r.mesa.numeroMesa ?? r.mesa.numero)) ?? (r.numeroMesa ?? (r.mesaId ? (r.mesaId.numeroMesa ?? r.mesaId) : ''));
              const time = r.fechaHoraInicio ? new Date(r.fechaHoraInicio).toLocaleString('es-ES') : '';
              const estado = (r.estado ?? '').toString().toLowerCase();
              const icon = estado.includes('confirm') ? '✅' : estado.includes('cancel') || estado.includes('no_show') ? '❌' : '🪑';
              const text = `Reserva de ${clienteName} — Mesa ${mesaNum}`;
              return { icon, text, time };
            });
          }
        },
        error: () => {}
      });
    } catch (e) {
      // ignore and keep mock data
      console.warn('Dashboard service fetch failed', e);
    }
  }

  private formatDateLabel(dateStr: string) {
    try {
      if (!dateStr) return '';
      // Parse YYYY-MM-DD safely into local Date to avoid timezone drift
      const parts = dateStr.split('-').map(p => parseInt(p, 10));
      if (parts.length < 3 || parts.some(isNaN)) return dateStr;
      const [y, m, d] = parts;
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString('es-ES', { weekday: 'short' });
    } catch (e) {
      return dateStr;
    }
  }

  getOccupancyPercentage(): number {
    return Math.round((this.stats.occupiedTables / this.stats.totalTables) * 100);
  }

  getTableStatusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

interface DashboardStats {
  totalReservations: number;
  todayReservations: number;
  occupiedTables: number;
  totalTables: number;
  activeClients: number;
  revenue: number;
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

        <div class="stat-card info">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <h3>Ingresos Hoy</h3>
            <div class="stat-number">\${{ stats.revenue | number:'1.0-0' }}</div>
            <div class="stat-subtitle">promedio diario</div>
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
  styles: [/* styles omitted for brevity; main styles live in global scss */]
})
export class DashboardComponent {
  currentUser: any = null;

  stats: DashboardStats = {
    totalReservations: 145,
    todayReservations: 23,
    occupiedTables: 8,
    totalTables: 12,
    activeClients: 89,
    revenue: 4250
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

  constructor(private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser();
  }

  getOccupancyPercentage(): number {
    return Math.round((this.stats.occupiedTables / this.stats.totalTables) * 100);
  }

  getTableStatusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }
}

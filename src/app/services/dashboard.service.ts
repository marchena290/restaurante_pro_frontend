import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private api = environment.apiUrl || '';

  constructor(private http: HttpClient) {}

  getReservasStats(days = 7): Observable<Array<{ date: string; count: number }>> {
    return this.http.get<Array<{ date: string; count: number }>>(`${this.api}/reservas/stats?days=${days}`);
  }

  getMesasOcupadas(): Observable<{ occupied: number; total: number } | number> {
    return this.http.get<any>(`${this.api}/mesas/ocupadas`);
  }

  getClientesActivos(days = 30): Observable<{ active: number } | number> {
    return this.http.get<any>(`${this.api}/clientes/activos?days=${days}`);
  }
}

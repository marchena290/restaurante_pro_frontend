import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Mesa, CreateMesaDto, UpdateMesaDto } from '../models/mesa.model';

@Injectable({ providedIn: 'root' })
export class MesasService {
  private baseUrl = `${environment.apiUrl}/mesas`;

  constructor(private http: HttpClient) {}

  list(): Observable<Mesa[]> {
    return this.http.get<Mesa[]>(this.baseUrl);
  }

  get(mesaId: number | string): Observable<Mesa> {
    return this.http.get<Mesa>(`${this.baseUrl}/${mesaId}`);
  }

  create(dto: CreateMesaDto): Observable<Mesa> {
    return this.http.post<Mesa>(this.baseUrl, dto);
  }

  update(mesaId: number | string, dto: UpdateMesaDto): Observable<Mesa> {
    return this.http.put<Mesa>(`${this.baseUrl}/${mesaId}`, dto);
  }

  delete(mesaId: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${mesaId}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cliente, CreateClienteDto, UpdateClienteDto } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private baseUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  list(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.baseUrl);
  }

  get(clienteId: number | string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/${clienteId}`);
  }

  create(dto: CreateClienteDto): Observable<Cliente> {
    return this.http.post<Cliente>(this.baseUrl, dto);
  }

  update(clienteId: number | string, dto: UpdateClienteDto): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.baseUrl}/${clienteId}`, dto);
  }

  delete(clienteId: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${clienteId}`);
  }
}

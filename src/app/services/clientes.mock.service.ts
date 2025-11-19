import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Cliente, CreateClienteDto, UpdateClienteDto } from '../models/cliente.model';

const MOCK_CLIENTES: Cliente[] = [
  { clienteId: 1, nombre: 'Carlos', apellido: 'Gomez', telefono: '555-1234', email: 'carlos@example.com' , nota: null},
  { clienteId: 2, nombre: 'Luisa', apellido: 'Martinez', telefono: '555-5678', email: 'luisa@example.com', nota: 'Vegetariana' }
];

@Injectable({ providedIn: 'root' })
export class ClientesMockService {
  list(): Observable<Cliente[]> {
    return of(MOCK_CLIENTES.slice());
  }

  get(clienteId: number | string): Observable<Cliente> {
    const found = MOCK_CLIENTES.find(c => String(c.clienteId) === String(clienteId)) as Cliente;
    return of(found);
  }

  create(dto: CreateClienteDto): Observable<Cliente> {
    const nextId = MOCK_CLIENTES.length + 1;
    const created: Cliente = { clienteId: nextId, nombre: dto.nombre, apellido: dto.apellido ?? null, telefono: dto.telefono ?? null, email: dto.email ?? null, nota: dto.nota ?? null };
    MOCK_CLIENTES.push(created);
    return of(created);
  }

  update(clienteId: number | string, dto: UpdateClienteDto): Observable<Cliente> {
    const idx = MOCK_CLIENTES.findIndex(c => String(c.clienteId) === String(clienteId));
    if (idx === -1) return of(undefined as any);
    const current = MOCK_CLIENTES[idx];
    const updated: Cliente = { ...current, ...dto } as Cliente;
    MOCK_CLIENTES[idx] = updated;
    return of(updated);
  }

  delete(clienteId: number | string): Observable<void> {
    const idx = MOCK_CLIENTES.findIndex(c => String(c.clienteId) === String(clienteId));
    if (idx !== -1) MOCK_CLIENTES.splice(idx, 1);
    return of(void 0);
  }
}

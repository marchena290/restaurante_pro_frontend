import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Mesa, CreateMesaDto, UpdateMesaDto } from '../models/mesa.model';

const MOCK_MESAS: Mesa[] = [
  { mesaId: 1, numero: 1, capacidad: 4, ubicacion: 'Interior', activo: true },
  { mesaId: 2, numero: 2, capacidad: 2, ubicacion: 'Terraza', activo: true }
];

@Injectable({ providedIn: 'root' })
export class MesasMockService {
  list(): Observable<Mesa[]> {
    return of(MOCK_MESAS.slice());
  }

  get(mesaId: number | string): Observable<Mesa> {
    const found = MOCK_MESAS.find(m => String(m.mesaId) === String(mesaId)) as Mesa;
    return of(found);
  }

  create(dto: CreateMesaDto): Observable<Mesa> {
    const nextId = MOCK_MESAS.length + 1;
    const created: Mesa = { mesaId: nextId, numero: dto.numero, capacidad: dto.capacidad, ubicacion: dto.ubicacion ?? null, activo: true };
    MOCK_MESAS.push(created);
    return of(created);
  }

  update(mesaId: number | string, dto: UpdateMesaDto): Observable<Mesa> {
    const idx = MOCK_MESAS.findIndex(m => String(m.mesaId) === String(mesaId));
    if (idx === -1) return of(undefined as any);
    const current = MOCK_MESAS[idx];
    const updated: Mesa = { ...current, ...dto } as Mesa;
    MOCK_MESAS[idx] = updated;
    return of(updated);
  }

  delete(mesaId: number | string): Observable<void> {
    const idx = MOCK_MESAS.findIndex(m => String(m.mesaId) === String(mesaId));
    if (idx !== -1) MOCK_MESAS.splice(idx, 1);
    return of(void 0);
  }
}

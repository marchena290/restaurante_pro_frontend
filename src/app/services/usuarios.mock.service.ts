import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Usuario, CreateUsuarioDto, UpdateUsuarioDto } from '../models/usuario.model';

const MOCK_USUARIOS: Usuario[] = [
  { id: 1, username: 'admin', email: 'admin@example.com', nombre: 'Admin', apellido: 'Root', roles: ['ROLE_ADMIN'], activo: true },
  { id: 2, username: 'empleado', email: 'empleado@example.com', nombre: 'Juan', apellido: 'Perez', roles: ['ROLE_EMPLEADO'], activo: true }
];

@Injectable({ providedIn: 'root' })
export class UsuariosMockService {
  list(): Observable<Usuario[]> {
    return of(MOCK_USUARIOS.slice());
  }

  get(usuarioId: number | string): Observable<Usuario> {
    const found = MOCK_USUARIOS.find(u => String(u.id) === String(usuarioId)) as Usuario;
    return of(found);
  }

  create(dto: CreateUsuarioDto): Observable<Usuario> {
    const nextId = MOCK_USUARIOS.length + 1;
    const created: Usuario = { id: nextId, username: dto.username, email: dto.email ?? null, nombre: '', apellido: '', roles: dto.roles ?? [], activo: true };
    MOCK_USUARIOS.push(created);
    return of(created);
  }

  update(usuarioId: number | string, dto: UpdateUsuarioDto): Observable<Usuario> {
    const idx = MOCK_USUARIOS.findIndex(u => String(u.id) === String(usuarioId));
    if (idx === -1) return of(undefined as any);
    const current = MOCK_USUARIOS[idx];
    const updated: Usuario = { ...current, ...dto } as Usuario;
    MOCK_USUARIOS[idx] = updated;
    return of(updated);
  }

  delete(usuarioId: number | string): Observable<void> {
    const idx = MOCK_USUARIOS.findIndex(u => String(u.id) === String(usuarioId));
    if (idx !== -1) MOCK_USUARIOS.splice(idx, 1);
    return of(void 0);
  }
}

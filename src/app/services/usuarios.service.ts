import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface UsuarioDto {
  id: number;
  username: string;
  nombre?: string;
  email?: string;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private base = `${environment.apiUrl}/usuarios`;
  constructor(private http: HttpClient) {}

  list(): Observable<UsuarioDto[]> {
    return this.http.get<UsuarioDto[]>(this.base);
  }

  get(id: number | string) {
    return this.http.get<UsuarioDto>(`${this.base}/${id}`);
  }

  // create/update/delete
  create(payload: { username: string; password: string; nombre?: string; email?: string; role?: string }) {
    return this.http.post<UsuarioDto>(this.base, payload);
  }

  update(id: number | string, payload: { nombre?: string; email?: string; role?: string; password?: string }) {
    return this.http.put<UsuarioDto>(`${this.base}/${id}`, payload);
  }

  delete(id: number | string) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}

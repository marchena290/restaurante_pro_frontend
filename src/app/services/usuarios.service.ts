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

  // create/update/delete can be added later
}

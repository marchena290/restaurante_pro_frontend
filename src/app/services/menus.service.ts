import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MenuItem, CreateMenuItemDto, UpdateMenuItemDto } from '../models/menu.model';

// Backend uses the "plato" entity and routes under /api/platos.
// This service adapts the backend contract to the frontend `MenuItem` shape.
@Injectable({ providedIn: 'root' })
export class MenusService {
  private baseUrl = `${environment.apiUrl}/platos`;

  constructor(private http: HttpClient) {}

  private mapPlatoToMenu(p: any): MenuItem {
    return {
      id: String(p.platoId ?? p.id ?? ''),
      name: p.nombre ?? p.name ?? '',
      description: p.descripcion ?? p.description ?? null,
      price: typeof p.precio === 'number' ? p.precio : Number(p.precio ?? 0),
      createdAt: p.createdAt ? new Date(p.createdAt) : undefined
    } as MenuItem;
  }

  list(): Observable<MenuItem[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      map(arr => (arr || []).map(a => this.mapPlatoToMenu(a)))
    );
  }

  get(menuId: number | string): Observable<MenuItem> {
    return this.http.get<any>(`${this.baseUrl}/${menuId}`).pipe(map(a => this.mapPlatoToMenu(a)));
  }

  create(dto: CreateMenuItemDto): Observable<MenuItem> {
    const body = {
      nombre: dto.name,
      descripcion: dto.description ?? null,
      precio: dto.price,
      disponible: true
    };
    return this.http.post<any>(this.baseUrl, body).pipe(map(a => this.mapPlatoToMenu(a)));
  }

  update(menuId: number | string, dto: UpdateMenuItemDto): Observable<MenuItem> {
    const body: any = {};
    if (dto.name !== undefined) body.nombre = dto.name;
    if (dto.description !== undefined) body.descripcion = dto.description;
    if (dto.price !== undefined) body.precio = dto.price;
    return this.http.put<any>(`${this.baseUrl}/${menuId}`, body).pipe(map(a => this.mapPlatoToMenu(a)));
  }

  delete(menuId: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${menuId}`);
  }
}

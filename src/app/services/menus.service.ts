import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MenuItem, CreateMenuItemDto, UpdateMenuItemDto } from '../models/menu.model';

@Injectable({ providedIn: 'root' })
export class MenusService {
  private baseUrl = `${environment.apiUrl}/menus`;

  constructor(private http: HttpClient) {}

  list(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(this.baseUrl);
  }

  get(menuId: number | string): Observable<MenuItem> {
    return this.http.get<MenuItem>(`${this.baseUrl}/${menuId}`);
  }

  create(dto: CreateMenuItemDto): Observable<MenuItem> {
    return this.http.post<MenuItem>(this.baseUrl, dto);
  }

  update(menuId: number | string, dto: UpdateMenuItemDto): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.baseUrl}/${menuId}`, dto);
  }

  delete(menuId: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${menuId}`);
  }
}

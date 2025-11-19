import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MenuItem, CreateMenuItemDto, UpdateMenuItemDto } from '../models/menu.model';

const MOCK_MENU: MenuItem[] = [
  { id: '1', name: 'Ensalada César', description: 'Lechuga, pollo, aderezo', price: 8.5, createdAt: new Date() },
  { id: '2', name: 'Pizza Margarita', description: 'Tomate, mozzarella, albahaca', price: 10.0, createdAt: new Date() }
];

@Injectable({ providedIn: 'root' })
export class MenusMockService {
  list(): Observable<MenuItem[]> {
    return of(MOCK_MENU.slice());
  }

  get(menuId: number | string): Observable<MenuItem> {
    const found = MOCK_MENU.find(m => String(m.id) === String(menuId)) as MenuItem;
    return of(found);
  }

  create(dto: CreateMenuItemDto): Observable<MenuItem> {
    const nextId = MOCK_MENU.length + 1;
    const created: MenuItem = { id: String(nextId), name: dto.name, description: dto.description ?? null, price: dto.price, createdAt: new Date() } as MenuItem;
    MOCK_MENU.push(created);
    return of(created);
  }

  update(menuId: number | string, dto: UpdateMenuItemDto): Observable<MenuItem> {
    const idx = MOCK_MENU.findIndex(m => String(m.id) === String(menuId));
    if (idx === -1) return of(undefined as any);
    const current = MOCK_MENU[idx];
    const updated: MenuItem = { ...current, ...dto } as MenuItem;
    MOCK_MENU[idx] = updated;
    return of(updated);
  }

  delete(menuId: number | string): Observable<void> {
    const idx = MOCK_MENU.findIndex(m => String(m.id) === String(menuId));
    if (idx !== -1) MOCK_MENU.splice(idx, 1);
    return of(void 0);
  }
}

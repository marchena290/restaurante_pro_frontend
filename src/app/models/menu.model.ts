export interface Menu {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  createdAt?: Date;
}

export interface CreateMenuRequest {
  name: string;
  description?: string;
  price: number;
}

export interface UpdateMenuRequest {
  name?: string;
  description?: string;
  price?: number;
}

// Backwards-compatible type
export type MenuItem = Menu;

// Aliases to match service DTO names used elsewhere in the codebase
export type CreateMenuItemDto = CreateMenuRequest;
export type UpdateMenuItemDto = UpdateMenuRequest;


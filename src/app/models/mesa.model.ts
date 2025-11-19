export interface Mesa {
  mesaId: number | string;
  numero: number;
  capacidad: number;
  ubicacion?: string | null; // e.g., terraza, interior
  activo?: boolean;
}

export interface CreateMesaDto {
  numero: number;
  capacidad: number;
  ubicacion?: string;
}

export interface UpdateMesaDto {
  numero?: number;
  capacidad?: number;
  ubicacion?: string;
  activo?: boolean;
}

export interface Table {
  id: string;
  name: string;
  capacity: number;
  status: 'Disponible' | 'Ocupada' | 'Reservada' | 'Mantenimiento' | string;
  location?: string;
  createdAt?: Date;
}

export interface CreateTableRequest {
  name: string;
  capacity: number;
  location?: string;
}

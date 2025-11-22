export interface Reservation {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  tableId: string;
  tableName: string;
  date: string; // ISO date
  time: string; // HH:mm
  guests: number;
  status: 'Confirmada' | 'Pendiente' | 'Cancelada' | 'Completada' | string;
  // CSS-safe class token derived from the technical estado (e.g. 'pendiente', 'confirmada', 'en-curso')
  statusClass?: string;
  notes?: string;
  createdAt?: Date;
}

export interface CreateReservationRequest {
  clientId: string;
  tableId: string;
  date: string;
  time: string;
  guests: number;
  notes?: string;
}

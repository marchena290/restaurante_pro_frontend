export interface Reservation {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  tableId: string;
  tableName: string;
  fechaHoraInicio: Date; // Objeto Date para que DatePipe interprete correctamente la zona horaria local
  date: string; // ISO date (YYYY-MM-DD) - maintained for form compatibility
  time: string; // HH:mm - maintained for form compatibility
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

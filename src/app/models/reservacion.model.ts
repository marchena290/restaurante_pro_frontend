export type EstadoReserva = 'PENDIENTE' | 'CONFIRMADO' | 'EN_CURSO' | 'FINALIZADA' | 'CANCELADA' | 'NO_SHOW' | string;

export interface Cliente {
  clientedId: number;
  nombre: string;
  telefono?: string;
  email?: string | null;
  direccion?: string | null;
}

export interface Mesa {
  mesaId: number;
  numneroMesa: number;
  capacidad: number;
  estado?: string;
}

export interface Reserva {
  reservaId: number;
  cliente?: Cliente;
  mesaId?: number;
  fechaHoraInicio: string;
  duracionMinutos: number;
  estado?: EstadoReserva;
  nota?: string | null;
  fechaConfirmacion?: string | null;
  fechaFinReal?: string | null;
}

export interface CreateReservaDto {
  clienteId: number;
  mesaId: number;
  reservaId?: number;
  fechaHoraInicio: string;
  duracionMinutos: number;
  cantidadPersonas: number;
  nota?: string;
}

export interface UpdateReservaDto {
  mesaId?: number;
  fechaHoraInicio?: string;
  duracionMinutos?: number;
  cantidadPersonas?: number;
  nota?: string;
  estado?: EstadoReserva
}

export interface ChangeEstadoDto {
  estado: EstadoReserva;
  fechaConfirmacion?: string | null;
}

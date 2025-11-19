export interface Cliente {
  clienteId: number | string;
  nombre: string;
  apellido?: string | null;
  telefono?: string | null;
  email?: string | null;
  nota?: string | null;
}

export interface CreateClienteDto {
  nombre: string;
  apellido?: string;
  telefono?: string;
  email?: string;
  nota?: string;
}

export interface UpdateClienteDto {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  email?: string;
  nota?: string;
}

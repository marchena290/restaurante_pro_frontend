export interface Usuario {
  id: number | string;
  username: string;
  email?: string | null;
  nombre?: string | null;
  apellido?: string | null;
  roles?: string[]; // e.g. ['ADMIN', 'EMPLEADO']
  activo?: boolean;
}

export interface CreateUsuarioDto {
  username: string;
  password: string;
  email?: string;
  roles?: string[];
}

export interface UpdateUsuarioDto {
  username?: string;
  email?: string;
  nombre?: string;
  apellido?: string;
  roles?: string[];
  activo?: boolean;
}

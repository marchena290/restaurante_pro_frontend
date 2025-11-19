export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string | null;
  createdAt?: Date;
  totalReservations?: number;
}

export interface CreateClientRequest {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

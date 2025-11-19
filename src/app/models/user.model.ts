export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Empleado' | string;
  active: boolean;
  password?: string;
  createdAt?: Date;
}

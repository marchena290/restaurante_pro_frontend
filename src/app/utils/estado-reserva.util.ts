export function humanizeEstadoReserva(estado?: string): string {
  if (!estado) return '';
  const s = String(estado).toUpperCase();
  switch (s) {
    case 'PENDIENTE': return 'Pendiente';
    case 'CONFIRMADA': return 'Confirmada';
    case 'CONFIRMADO': return 'Confirmada';
    case 'EN_CURSO': return 'Reserva en curso';
    case 'FINALIZADA': return 'Finalizada';
    case 'CANCELADA': return 'Cancelada';
    default: return estado;
  }
}

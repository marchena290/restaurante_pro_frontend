import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CreateReservaDto, Reserva, UpdateReservaDto, ChangeEstadoDto } from '../models/reservacion.model';

@Injectable({
  providedIn: 'root'
})
export class ReservacionesService {
  private baseUrl = `${environment.apiUrl}/reservas`;

  constructor(private http: HttpClient) {}

  list(): Observable<Reserva[]>{
    return this.http.get<Reserva[]>(this.baseUrl);
  }


  get(reservaId: number): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.baseUrl}/${reservaId}`);
  }

  create(dto: CreateReservaDto): Observable<Reserva> {
    // Backend expects a Reserva-like payload where cliente and mesa are objects
    const body: any = {
      fechaHoraInicio: dto.fechaHoraInicio,
      duracionMinutos: dto.duracionMinutos,
      cantidadPersonas: dto.cantidadPersonas,
      nota: dto.nota ?? null,
      // include both object and top-level ids to be compatible with different backends
      cliente: { clienteId: dto.clienteId },
      clienteId: dto.clienteId,
      mesa: { mesaId: dto.mesaId },
      mesaId: dto.mesaId,
      estado: (dto as any).estado ?? 'PENDIENTE'
    };
    return this.http.post<Reserva>(this.baseUrl, body);
  }

  update(reservaiD: number, dto: UpdateReservaDto): Observable<Reserva> {
    // send mesa/cliente as nested objects if present to match backend Reserva model
    const body: any = { ...dto };
    if ((dto as any).mesaId !== undefined) {
      body.mesa = { mesaId: (dto as any).mesaId };
      body.mesaId = (dto as any).mesaId;
    }
    if ((dto as any).clienteId !== undefined) {
      body.cliente = { clienteId: (dto as any).clienteId };
      body.clienteId = (dto as any).clienteId;
    }
    return this.http.put<Reserva>(`${this.baseUrl}/${reservaiD}`, body);
  }

  changeEstado(reservaiD: number, dto: ChangeEstadoDto): Observable<Reserva> {
    return this.http.patch<Reserva>(`${this.baseUrl}/${reservaiD}/estado`, dto);
  }

  delete(reservaId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${reservaId}`);
  }
}

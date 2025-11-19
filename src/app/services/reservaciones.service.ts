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
    return this.http.post<Reserva>(this.baseUrl, dto);
  }

  update(reservaiD: number, dto: UpdateReservaDto): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.baseUrl}/${reservaiD}`, dto);
  }

  changeEstado(reservaiD: number, dto: ChangeEstadoDto): Observable<Reserva> {
    return this.http.patch<Reserva>(`${this.baseUrl}/${reservaiD}/estado`, dto);
  }

  delete(reservaId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${reservaId}`);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/api/api.service';
import { Minero, MineroRequest } from './minero';

@Injectable({ providedIn: 'root' })
export class MineroService {
  private readonly http = inject(HttpClient);
  private readonly url = inject(ApiService).buildUrl('/api/v1/acopio/mineros');
  listar(): Observable<Minero[]> { return this.http.get<Minero[]>(this.url); }
  obtener(id: number): Observable<Minero> { return this.http.get<Minero>(`${this.url}/${id}`); }
  crear(request: MineroRequest): Observable<Minero> { return this.http.post<Minero>(this.url, request); }
  actualizar(id: number, request: MineroRequest): Observable<Minero> { return this.http.put<Minero>(`${this.url}/${id}`, request); }
  eliminar(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}

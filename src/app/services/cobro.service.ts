import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

// Interface para crear cobro
export interface CreateCobroDto {
  prestamo_id: number;
  usuario_id: number;
  monto_cobrado: number;
}

// Interface para recibir datos completos del cobro
export interface Cobro {
  cobro_id?: number;
  prestamo_id: number;
  usuario_id: number;
  cliente_nombre: string;
  fecha_cobro: string;
  monto_cobrado: number;
  estado: string;
  nombrecliente?: string;
  idprestamo?: number;
  direccioncliente?: string;
  telefonocliente?: string;
  ruta_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Cobrohistorial {
  fecha: Date;
  estado: string;
  monto: number;
}
export interface RespuestaRuta {
  cobros: Cobro[];
  "Base Inicial": string;
  recaudado: number;
  egresos: number;
  total: string;
}

@Injectable({
  providedIn: 'root'
})
export class CobroService {
  private apiUrl = `${environment.apiUrl}/cobro`;

  constructor(private http: HttpClient) { }

  // NUEVO: Validar múltiples cobros (Aprobar Todo)
  // Usamos PATCH para actualización parcial del estado
  validarMultiplesCobros(cobroIds: number[]): Observable<{message: string}> {
    return this.http.patch<{message: string}>(`${this.apiUrl}/validarMultiplesCobros`, { cobroIds: cobroIds });
  }

  getCobros(): Observable<Cobro[]> {
    // Corregido para que apunte a la ruta de cobros por defecto o la que definas
    return this.http.get<Cobro[]>(`${this.apiUrl}/list`); 
  }

  getCobro(id: number | string): Observable<Cobro> {
    return this.http.get<Cobro>(`${this.apiUrl}/getCobroById/${id}`);
  }

  editCobro(id: number | string, cobro: Partial<Cobro>): Observable<Cobro> {
    return this.http.put<Cobro>(`${this.apiUrl}/updateCobro/${id}`, cobro);
  }
  
  getClientesByuser(userId: number | string): Observable<Cobro[]> {
    // Nota: Aquí tenías Hardcoded el '1', podrías usar `${userId}` en el futuro
    return this.http.get<Cobro[]>(`${this.apiUrl}/getClientesByRuta/${userId}`);
  }

  createCobro(cobro: CreateCobroDto): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/createCobro`, cobro).pipe(
    catchError((error) => {
      // Retornamos el error tal cual para que el componente lo maneje,
      // o podemos pre-procesarlo aquí.
      return throwError(() => error);
    })
  );
}

  getCobrosByRutaId(rutaId: number | string): Observable<Cobro[]> {
    return this.http.get<Cobro[]>(`${this.apiUrl}/getCobrosByRutaid/${rutaId}`);
  }

  gethistorialcobros(prestamoId: number | string): Observable<Cobrohistorial[]> {
    return this.http.get<Cobrohistorial[]>(`${this.apiUrl}/getCobrosByPrestamoId/${prestamoId}`);
  }

 

updateMontoCobroConCaja(cobro_id: number, monto: number): Observable<any> {
  return this.http.patch(`${this.apiUrl}/updateMontoCobroConCaja/${cobro_id}`, { monto }).pipe(
    tap(response => console.log('Monto de cobros actualizado con caja:', response)),
    catchError(err => {
      console.error('Error al actualizar monto de cobros con caja:', err);
      throw err;
    })
  ); 
}

getEgresosOperacionCobrador(sucursalId: number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/getEgresosOperacionCobrador/${sucursalId}`).pipe(
    catchError(err => {
      console.error('Error al obtener egresos:', err);
      throw err;
    })
  );
}

getResumenCobrosCobradorRuta(sucursalId: number): Observable<any[]> {
    const url = `${this.apiUrl}/resumenCobrosCoradorRuta/${sucursalId}`;
    console.log('prueba bac', url);
    return this.http.get<any[]>(url).pipe(
      tap(resumen => console.log('Resumen de ruta cargado:', resumen)),
      catchError(err => {
        console.error('Error al obtener resumen de cobros por ruta:', err);
        throw err;
      })
    );
  }

  getTotalCobradoHoy(sucursalId: number | string): Observable<{ total_cobro_hoy: string | number }> {
    return this.http.get<{ total_cobro_hoy: string | number }>(
      `${this.apiUrl}/getTotalCobradoHoy/${sucursalId}`
    ).pipe(
      tap(response => console.log('Respuesta del servidor:', response)),
      catchError(err => {
        console.error('Error al obtener el total cobrado hoy:', err);
        return throwError(() => err);
      })
    );
  }

}
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Prestamos {
  prestamo_id: number;
  cliente_id: number;         
  periodo_id: number;
  tipo_prestamo_id: number;    
  monto_prestamo: string | number; 
  saldo_pendiente: string | number;
  valor_intereses: string | number;
  valor_cuota: string | number; 
  fecha_desembolso: string | Date; 
  fecha_fin_prestamo: string | Date | null;
  created_at?: string;       
  estado_prestamo: string; 
  cliente: string;
  nombre_cliente?: string; 
  sucursal_id?: number;
  id_usuario_creacion: number;
  total_cartera:number;
  capital_en_calle:number;
  intereses_proyectados:number;
}

export interface PrestamoCliente {
  prestamo_id: number;
  cliente: string;
  saldo_pendiente: string;
  valor_cuota: string;
  fecha_fin_prestamo: string | null;
}

export interface CobroDetalle {
  fecha_cobro: string;
  monto_cobrado: string;
  estado: string;
  cobro_id?: number;
}

export interface PrestamoCobros {
  id_prestamo: number;
  nombre_cliente: string;
  saldo_pendiente: string;
  valor_cuota: string;
  fecha_fin_prestamo: string | null;
  data: CobroDetalle[];
  nombre_ruta?: string;
}


@Injectable({
  providedIn: 'root'
})
export class PrestamoService {
  private apiUrl = `${environment.apiUrl}/prestamo`;

  constructor(private http: HttpClient) {}

  getPrestamos(): Observable<Prestamos[]> {
    return this.http.get<Prestamos[]>(`${this.apiUrl}/getPrestamos`);
  }

  getPrestamosByCliente(cliente_id: number): Observable<PrestamoCliente[]> {
    return this.http.get<PrestamoCliente[]>(`${this.apiUrl}/getPrestamosByCliente/${cliente_id}`);
  }

  getPrestamoCobros(prestamo_id: number): Observable<PrestamoCobros> {
    return this.http.get<PrestamoCobros>(`${this.apiUrl}/prestamoCobros/${prestamo_id}`);
  }

  getPrestamoById (prestamo_id: number): Observable<Prestamos> {  
    return this.http.get<Prestamos>(`${this.apiUrl}/getPrestamoById/${prestamo_id}`);
  }

  updatePrestamo(id: number, prestamo: Partial<Prestamos>): Observable<Prestamos> {
    return this.http.put<Prestamos>(`${this.apiUrl}/updatePrestamo/${id}`, prestamo);
  }

  getPrestamoInfoById(prestamo_id: number): Observable<Prestamos> {
    return this.http.get<Prestamos>(`${this.apiUrl}/getPrestamoInfoById/${prestamo_id}`);
  }
 
createPrestamo(prestamo: Partial<Prestamos>): Observable<Prestamos> {
  return this.http.post<Prestamos>(`${this.apiUrl}/createPrestamo`, prestamo).pipe(
    catchError((error: HttpErrorResponse) => {
      // Log detallado para depuración
      console.error('Error en el servicio de préstamos:', error);

      // Si el error es un 404 (como en tu imagen 1), suele venir como HTML string
      if (error.status === 404) {
        return throwError(() => ({
          message: 'La ruta de creación no fue encontrada en el servidor (404).'
        }));
      }

      // Si el error es 400 (imágenes 2 y 3), extraemos el mensaje del JSON
      const serverMessage = error.error?.error || error.error?.message || 'Error inesperado en el servidor';
      
      return throwError(() => ({
        message: serverMessage,
        status: error.status
      }));
    })
  );
}
  getPrestamosPendientesBySucursal(sucursalId: number | string): Observable<Prestamos[]> {
  return this.http.get<Prestamos[]>(`${this.apiUrl}/prestamosPendientes/${sucursalId}`);
}

confirmarPrestamo(prestamo_id: number): Observable<any> { 
  return this.http.patch<any>(`${this.apiUrl}/confirmarPrestamo/${prestamo_id}`, {});
}

rechazarPrestamo(id: number) {
  return this.http.patch(`${this.apiUrl}/rechazarPrestamo/${id}`, {  });
}
  
 
getTotalCarteraSucursal(sucursal_id: number): Observable<Prestamos> {
    return this.http.get<Prestamos>(`${this.apiUrl}/TotalCarteraSucursal/${sucursal_id}`);
  }
getCapitalEnCalle(sucursal_id: number): Observable<Prestamos> {
    return this.http.get<Prestamos>(`${this.apiUrl}/getCapitalEnCalle/${sucursal_id}`);
  }

  getInteresesProyectados(sucursal_id: number): Observable<Prestamos> {
    return this.http.get<Prestamos>(`${this.apiUrl}/getInteresesProyectados/${sucursal_id}`);
  }

  getDesglosePrestamos(sucursalId: number | string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/getDesglosePrestamos/${sucursalId}`).pipe(
    tap(data => console.log('Desglose de préstamos recibido:', data)),
    catchError(err => {
      console.error('Error al obtener el desglose:', err);
      return throwError(() => err);
    })
  );
}



}

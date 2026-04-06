import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpParams } from '@angular/common/http';

// Interfaz para definir la estructura de un movimiento
export interface MovimientoCajaSucursal {
  movimiento_id: number;
  caja_sucursal_id: number;
  usuario_responsable_id: number;
  tipo_movimiento: 'ingreso' | 'egreso';
  monto: string; // El backend lo envía como string
  descripcion: string;
  fecha_movimiento: string;
  estado_movto: string;
}

export interface CajaSucursal {
  caja_sucursal_id: number;
  sucursal_id: number;
  saldo_actual: string | number; // Viene como string del backend
  fecha_ultima_actualizacion: string;
}
export interface ReporteGastosSucursal {
  gastos: number;
  total_prestamos: number;
  total_reembolsos: number;
}

@Injectable({
  providedIn: 'root'
})
export class CajaService {
  private readonly URL = `${environment.apiUrl}/movimientocajasucursal`;
  private readonly URLcaja = `${environment.apiUrl}/cajaSucursal`;

  constructor(private http: HttpClient) {}
 


  /**
   * Obtiene todos los movimientos de una sucursal específica
   * @param caja_sucursal_id ID de la sucursal
   */
  getMovimientos(caja_sucursal_id: number): Observable<MovimientoCajaSucursal[]> {
    console.log(`Cargando movimientos para caja_sucursal_id: ${caja_sucursal_id}`);
    return this.http.get<MovimientoCajaSucursal[]>(`${this.URL}/getmovimientos/${caja_sucursal_id}`);
  }
 

getCajaSucursal(sucursal_id: number, fecha?: string | Date): Observable<CajaSucursal | null> {
  // 1. Preparamos los parámetros
  let params = new HttpParams();
  
  if (fecha) {
    // Si es un objeto Date, lo convertimos a YYYY-MM-DD
    const fechaFmt = fecha instanceof Date 
      ? fecha.toISOString().split('T')[0] 
      : fecha;
    params = params.set('fecha', fechaFmt);
  }

  return this.http.get<any>(`${this.URLcaja}/getCajaSucursal/${sucursal_id}`, { params }).pipe(
    map(res => {
      if (res && res.caja_sucursal_id) {
        return {
          ...res,
          // Convertimos el string de la base de datos a número para cálculos en el front
          saldo_actual: parseFloat(res.saldo_actual)
        };
      }
      return null;
    }),
    catchError(err => {
      console.error('Error al obtener saldo de caja:', err);
      return of(null);
    })
  );
}

 /**
 * Registra un nuevo movimiento (Egreso/Ingreso) en la base de datos
 * @param movimiento Objeto con los datos del formulario
 */
createMovimiento(movimiento: any): Observable<any> {
  // Ajustado según la captura de Postman
  const body = {
    caja_sucursal_id: movimiento.caja_sucursal_id,
    usuario_responsable_id: movimiento.usuario_responsable_id, // Campo nuevo según imagen
    tipo_movimiento: movimiento.tipo, // Viene del selector 'ingreso'/'egreso'
    monto: movimiento.monto,
    descripcion: movimiento.descripcion
    // Nota: En tu imagen no envías fecha_movimiento, 
    // el backend probablemente la genera automáticamente.
  };

  console.log('Enviando movimiento al backend:', body);

  return this.http.post<any>(`${this.URL}/createmovimiento`, body).pipe(
    map(res => {
      // Si el backend responde con ok: true O si devuelve el objeto creado (res existe y no es false)
      if (res && (res.ok || res.ok === undefined)) return res;
      throw new Error(res.msg || 'Error al registrar el movimiento');
    }),
    catchError(err => {
      console.error('Error en el servidor:', err);
      throw err;
    })
  );
}

  /**
   * Elimina un movimiento por su ID
   * @param id ID del movimiento a eliminar
   */
  deleteMovimiento(id: number): Observable<any> {
    return this.http.patch<any>(`${this.URL}/anularmovimiento/${id}`, {});
  }

  getCajaInicialSucursal(sucursal_id: number | string): Observable<number> {
    const url = `${this.URLcaja}/cajaInicialSucursal/${sucursal_id}`;
    return this.http.get<any>(url).pipe(
      map(res => {
        const monto = res?.saldo_inicial || 0;
        console.log('caja',res);
        return parseFloat(monto.toString());
      }),
      catchError(err => {
        console.error('Error al obtener la caja inicial de la sucursal:', err);
        return of(0);
      })
    );
  }

  /**
   * Obtiene el reporte de gastos, préstamos y reembolsos de una sucursal.
   * Basado en el endpoint: /cajasucursal/getReporteGastosSucursal/:id
   * @param sucursal_id ID de la sucursal
   */
  getReporteGastosSucursal(sucursal_id: number | string): Observable<ReporteGastosSucursal> {
    const url = `${this.URLcaja}/getReporteGastosSucursal/${sucursal_id}`;
    
    return this.http.get<ReporteGastosSucursal>(url).pipe(
      map(res => ({
        // Aseguramos que los valores sean numéricos por si el backend los envía como string
        gastos: Number(res.gastos || 0),
        total_prestamos: Number(res.total_prestamos || 0),
        total_reembolsos: Number(res.total_reembolsos || 0)
      })),
      catchError(err => {
        console.error('Error al obtener reporte de gastos:', err);
        // Retornamos valores en 0 para no romper la vista
        return of({ gastos: 0, total_prestamos: 0, total_reembolsos: 0 });
      })
    );
  }

  /**
   * Obtiene el balance actual de una sucursal
   * @param sucursal_id ID de la sucursal
   
  getBalanceSucursal(sucursal_id: number): Observable<number> {
    return this.http.get<any>(`${this.URL}/balance/${sucursal_id}`).pipe(
      map(res => res.ok ? res.balance : 0)
    );
  }*/
}
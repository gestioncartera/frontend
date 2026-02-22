import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

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

  /**
 * Obtiene la información de la caja de una sucursal específica
 * @param sucursal_id ID de la sucursal
 */
getCajaSucursal(sucursal_id: number): Observable<CajaSucursal | null> {
  return this.http.get<any>(`${this.URLcaja}/getCajaSucursal/${sucursal_id}`).pipe(
    map(res => {
      // El backend retorna el objeto directamente
      if (res && res.caja_sucursal_id) {
        return {
          ...res,
          // Convertimos "10000.00" (string) a 10000 (number)
          saldo_actual: parseFloat(res.saldo_actual)
        };
      }
      return null;
    }),
    catchError(err => {
      console.error('Error al obtener saldo de caja:', err);
      return of (null);
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

  /**
   * Obtiene el balance actual de una sucursal
   * @param sucursal_id ID de la sucursal
   
  getBalanceSucursal(sucursal_id: number): Observable<number> {
    return this.http.get<any>(`${this.URL}/balance/${sucursal_id}`).pipe(
      map(res => res.ok ? res.balance : 0)
    );
  }*/
}
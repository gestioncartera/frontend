import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

// --- Interfaces basadas en tus capturas de Postman ---

export interface MovimientoCajadiario {
  movimiento_id: number;
  caja_sucursal_id: number;
  usuario_responsable_id: number;
  tipo_movimiento: 'ingreso' | 'egreso';
  monto: string | number;
  descripcion: string;
  fecha_movimiento: string;
  estado_movto: string;
  nombre_cobrador?: string;
}

export interface EgresoOperacion {
  concepto: string;    
  monto: number;       
  sucursal_id?: number;
  egreso_id?: number;
  usuario_id?: number;
  ruta_id?: number;
  fecha_gasto?: string; 
  descripcion?: string;
  created_at?: string;
  estado_egreso?: 'pendiente' | 'confirmado' | 'anulado';
}

export interface CajaDiario {
  caja_sucursal_id: number;
  sucursal_id: number;
  saldo_actual: number;
  fecha_ultima_actualizacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class CajaDiarioService {
  private readonly URL_CAJA = `${environment.apiUrl}/cajadiaria`;
  private readonly URL_EGRESO_OP = `${environment.apiUrl}/egresooperacion`;
  private readonly URL_MOVIMIENTO = `${environment.apiUrl}/movimientocajasucursal`; // Según image_b4da62.png

  constructor(private http: HttpClient) {}

  /**
   * 1. REGISTRAR MOVIMIENTO (Basado en image_b4da62.png)
   * URL: /api/movimientocajasucursal/createmovimiento/
   */
  createMovimiento(movimiento: Partial<MovimientoCajadiario>): Observable<any> {
    const url = `${this.URL_CAJA}/createmovimiento`;
    
    // Mapeo exacto de las llaves que pide tu Backend en la imagen
    const body = { 
      usuario_responsable_id: movimiento.usuario_responsable_id, 
      monto: movimiento.monto
    };

    return this.http.post<any>(url, body).pipe(
      catchError(err => {
        console.error('Error al crear movimiento:', err);
        throw err;
      })
    );
  }

 
getEgresosOperacionCobrador(usuario_id: number): Observable<EgresoOperacion[]> {
  const url = `${this.URL_EGRESO_OP}/getEgresosOperacionCobrador/${usuario_id}`;
  
  // Retornamos la petición al backend
  return this.http.get<EgresoOperacion[]>(url);
}

 getEgresosOperacionPendientes(usuario_id: number): Observable<EgresoOperacion[]> {
    const url = `${this.URL_EGRESO_OP}/getAllEgresosOperacionPendientes/${usuario_id}`;
    
     return this.http.get<EgresoOperacion[]>(url).pipe(
      tap(data => console.log('Datos obtenidos de egresos:', data)),
      catchError(err => {
         //captura de error
        const errorMessage = err.error?.error || 'Error desconocido en el servidor';
        console.error('Error del Backend:', errorMessage);
        
        // Retornamos el error completo para que el SnackBar en el componente lo muestre
        return throwError(() => err);
      })
    );
}

  /**
   * 3. ABRIR CAJA DIARIA (Basado en image_4f5574.png)
   * URL con parámetro de sucursal y body con usuario/monto
   */
  abrirCajaDiaria( id_sucursal: number, usuario_id: number, monto_base_inicial: number): Observable<any> {
    const url = `${this.URL_CAJA}/abrirCajaDiaria/${id_sucursal}`;
    const body = { usuario_id, monto_base_inicial };

    return this.http.post<any>(url, body);
  }

  /**
   * 4. OBTENER ESTADO DE CAJA
   */
 getCaja(cobra: number): Observable<CajaDiario | null> {
  return this.http.get<any>(`${this.URL_CAJA}/getCajaDiariaAbiertaByUsuario/${cobra}`).pipe(
    map(res => {
      if (!res) return null;

      // Extraemos el valor, si viene nulo o undefined usamos "0"
      let saldoRaw = res.saldo_actual || "0";

      // Si el saldo es un string, quitamos símbolos de moneda, comas y espacios
      if (typeof saldoRaw === 'string') {
        saldoRaw = saldoRaw.replace(/[^0-9.-]+/g, ""); 
      }

      const saldoNumerico = parseFloat(saldoRaw);

      return { 
        ...res, 
        // Si el parseo falla (NaN), devolvemos 0 para no romper el pipe currency
        saldo_actual: isNaN(saldoNumerico) ? 0 : saldoNumerico 
      };
    }),
    catchError(() => of(null))
  );
}

  /**
 * Actualiza el monto de una caja específica
 * @param idCaja ID que se envía en la URL
 * @param nuevaBase Valor numérico que se envía en el body
 */
updateCajaDiaria(idCaja: number, nuevaBase: number): Observable<any> {
  const url = `${this.URL_CAJA}/updateBase/${idCaja}`;
  
  // Cambiamos this.http.put por this.http.patch
  // Usamos la clave 'nuevaBase' que confirmamos en tu imagen de Postman
  return this.http.patch(url, { nuevaBase }).pipe(
    catchError(err => {
      console.error('Error al actualizar monto de caja (PATCH):', err);
      return throwError(() => err);
    })
  );
}

cerrarCajaDiaria(id: number, montoReal: number): Observable<any> {
  return this.http.patch<any>(`${this.URL_CAJA}/cerrarCajaDiaria/${id}`, {
    monto_final_real: montoReal
  });
}

aprobarEgresosCobrador(usuario_Id: number): Observable<any> {
  // Limpiamos la URL base de barras finales y el endpoint de barras iniciales
  const baseUrl = this.URL_EGRESO_OP.replace(/\/+$/, '');
  const endpoint = `confirmarEgresosOperacion/${usuario_Id}`.replace(/^\/+/, '');
  
  const fullUrl = `${baseUrl}/${endpoint}`;
  
  return this.http.post<any>(fullUrl, {}).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Error al confirmar egresos:', error);
      return throwError(() => error);
    })
  );
}
createEgresoOperacion(egreso: EgresoOperacion): Observable<any> {
    return this.http.post<any>(`${this.URL_EGRESO_OP}/createEgresoOperacion`, egreso).pipe(
      catchError((error: HttpErrorResponse) => {
        // Log para el desarrollador
        console.error('Error en createEgresoOperacion:', error);
        
        // Propagamos el error para que el SnackBar del componente lo capture
        return throwError(() => error);
      })
    );
  }

  getCajaDiariaAbiertaByUsuario(cobradorId: number): Observable<any> {
    return this.http.get<any>(`${this.URL_CAJA}/getCajaDiariaAbiertaByUsuario/${ cobradorId}`);
  }


}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; 


export interface Rutas {
  ruta_id?: number;
  sucursal_id: number;
  nombre_ruta: string;
  descripcion?: string;
  cobrador?: string;
  zona?: string;
  fecha_creacion?: Date;
  estado?: string;
  created_at?: Date;

}
@Injectable({
  providedIn: 'root'
})
export class RutasService {
 
  private apiUrl = `${environment.apiUrl}/ruta`; // Cambia esto a la URL de tu API backend

  constructor(private http: HttpClient) { }    

 getRutas(idSucursal: number | string): Observable<Rutas[]> { 
  const url = `${this.apiUrl}/getRutas/${idSucursal}`;
  
  return this.http.get<Rutas[]>(url);
}

 getRutascobro(idSucursal: number | string): Observable<Rutas[]> { 
  const url = `${this.apiUrl}/getRutasCobros/${idSucursal}`;
  
  return this.http.get<Rutas[]>(url);
}

  getRutasById(id: string): Observable<Rutas[]> {
    return this.http.get<Rutas[]>(`${this.apiUrl}/getRutaById/${id}`);
  } 

  findRuta(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getRutaById/${id}`);
  }
    
    createRutas(ruta: Rutas): Observable<Rutas> {
    return this.http.post<Rutas>(`${this.apiUrl}/createRuta`, ruta);
  } 
    editRutas(id: number, ruta: Partial<Rutas>): Observable<Rutas> {
    return this.http.put<Rutas>(`${this.apiUrl}/updateRuta/${id}`, ruta);
  }
    deleteRutas(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteRuta/${id}`);
  }
  
  asignarCobrador(payload: {
  ruta_id: number;
  cobrador_id: number;
}): Observable<void> {
  return this.http.post<void>(
    `${this.apiUrl}/asignar-ruta`,
    payload
  );
}

actualizarOrdenClientes(rutaId: number, orden: any[]): Observable<any> {
  // Enviamos el array de objetos {cliente_id, orden}
  return this.http.put(`${this.apiUrl}/rutas/update-orden/${rutaId}`, { orden });
}

 


}
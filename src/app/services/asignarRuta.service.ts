import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, Observable } from 'rxjs';



export interface RutaCobro{
    ruta_id: number; 
    usuario_id: number; 
}

@Injectable({
  providedIn: 'root'
})
export class AsignarRutaService {  
     private apiUrl = `${environment.apiUrl}/cliente`; 
          private apiUrlruta = `${environment.apiUrl}/asignacionRuta`; 
constructor(private http: HttpClient) { }

asignaCobrador(rutaCobro: RutaCobro): Promise<any> {
  // Creamos el objeto "payload" con los nombres exactos que espera el backend
  const payload = {
    ruta_id: rutaCobro.ruta_id,   // Asegúrate de que estos nombres
    usuario_id: rutaCobro.usuario_id // coincidan con tu API
  };
  console.log('Enviando asignación al backend:', payload); // Log para verificar el objeto antes de enviarlo
  return lastValueFrom(this.http.post<any>(`${this.apiUrlruta}/createAsignacionRuta`, payload));
}
 actualizarOrdenClientes(id_ruta: number, clientes: any[]): Observable<any> {
  // PATCH es correcto porque modificamos la columna 'orden' de registros existentes
  return this.http.patch(`${this.apiUrl}/actualizarOrdenClientes/${id_ruta}`, clientes);
}

    }   
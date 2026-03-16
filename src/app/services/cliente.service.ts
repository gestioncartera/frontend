import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Cliente{
  cliente_id: number; 
  sucursal_id:number
  nombres: string;
  apellidos:string
  numero_identificacion: string;
  telefono: string;
  direccion: string;
  fecha_registro: Date;
  estado: string;
  created_at: Date;
  id_ruta: number;
  
}
 
 

export interface ClienteCobro{
  cliente_id: number;
  nombrecliente: string;
  direccioncliente: string;
  telefonocliente: string | null;
  orden?: number;
   apellidos:string;
   
   
   }


@Injectable({
  providedIn: 'root'
})

export class ClienteService {
  private apiUrl = `${environment.apiUrl}/cliente`;

    constructor(private http: HttpClient) { }
    
 //clinetes de una ruta
getClientesByRuta(rutaId: number): Observable<ClienteCobro[]> {
  return this.http.get<ClienteCobro[]>(
    `${this.apiUrl}/getClientesByRuta/${rutaId}`
  );
}
getClientesRutaUser(user_id: number): Observable<Cliente[]> {
  return this.http.get<Cliente[]>(
    `${this.apiUrl}/getClientesRutaUser/${user_id}` );
}

 //clinetes de una ruta
getClientesByRutaPrestamo(rutaId: number): Observable<ClienteCobro[]> {
  return this.http.get<ClienteCobro[]>(
    `${this.apiUrl}/getClientesByRutaPrestamo/${rutaId}`
  );
}
 

getClientes(id_sucursal: number | string): Observable<Cliente[]> {
  return this.http.get<Cliente[]>(`${this.apiUrl}/getClientes/${id_sucursal}`);
}

getClientesPrestamo(id_sucursal: number | string): Observable<Cliente[]> {
  return this.http.get<Cliente[]>(`${this.apiUrl}/getClientesConPrestamosActivos/${id_sucursal}`);
}

getCliente(id: number): Observable<Cliente> {
  return this.http.get<Cliente>(`${this.apiUrl}/getClienteById/${id}`);
}

createCliente(idSucursal: number,  cliente: Partial<Cliente>): Observable<Cliente> {
  return this.http.post<Cliente>(`${this.apiUrl}/createCliente`, cliente);
}

updateCliente(id: number, cliente: Partial<Cliente>): Observable<Cliente> {
  // Creamos un nuevo objeto combinando los datos del cliente con el ID
  const body = { ...cliente, cliente_id: id };
  
  // Eliminamos el /${id} de la URL
  return this.http.put<Cliente>(`${this.apiUrl}/updateCliente`, body);
}

deleteCliente(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteCliente/${id}`);
}

 actualizarOrdenClientes(id_ruta: number, clientes: any[]): Observable<any> {
  // PATCH es correcto porque modificamos la columna 'orden' de registros existentes
  return this.http.patch(`${this.apiUrl}/actualizarOrdenClientes/${id_ruta}`, clientes);
}
    
}
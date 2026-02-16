import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SucursalContext {
  id: number;
  nombre: string;
  direccion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SucursalContextService {
  private readonly STORAGE_KEY = 'sucursalActual';
  private sucursalActualSubject = new BehaviorSubject<SucursalContext | null>(this.getSucursalFromStorage());
  public sucursalActual$ = this.sucursalActualSubject.asObservable();

  constructor() {}

  // Obtener sucursal del localStorage
  private getSucursalFromStorage(): SucursalContext | null {
    const sucursalStr = localStorage.getItem(this.STORAGE_KEY);
    if (!sucursalStr) return null;
    try {
      return JSON.parse(sucursalStr);
    } catch (e) {
      localStorage.removeItem(this.STORAGE_KEY);
      return null;
    }
  }

  // Establecer sucursal actual
  setSucursalActual(sucursal: SucursalContext): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sucursal));
    this.sucursalActualSubject.next(sucursal);
  }

  // Obtener sucursal actual
  getSucursalActual(): SucursalContext | null {
    return this.sucursalActualSubject.value;
  }

  // Obtener ID de sucursal actual
  getSucursalId(): number | null {
    const sucursal = this.getSucursalActual();
    return sucursal ? sucursal.id : null;
  }

  // Verificar si hay una sucursal seleccionada
  hasSucursalSeleccionada(): boolean {
    return this.getSucursalActual() !== null;
  }

  // Limpiar sucursal (para logout)
  clearSucursal(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.sucursalActualSubject.next(null);
  }
}

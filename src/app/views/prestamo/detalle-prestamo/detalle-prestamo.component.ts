import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PrestamoService, Prestamos, CobroDetalle } from '../../../services/prestamo.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // <--- AGREGAR ESTO
 import { TipoPrestamo, TipoPrestamoService } from '../../../services/tipoPrestamo.service';
import { CobroService } from '../../../services/cobro.service';
import { SucursalContextService } from '../../../services/sucursal-context.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
@Component({
  selector: 'app-detalle-prestamo',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule, 
    MatButtonModule, 
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './detalle-prestamo.component.html',
  styleUrls: ['./detalle-prestamo.component.scss']
})
export class DetallePrestamoComponent implements OnInit {
  prestamo: Prestamos | null = null;
  prestamoId: number | null = null;
  displayedColumns: string[] = ['fecha_cobro', 'monto_cobrado', 'estado'];
  tiposPrestamo: TipoPrestamo[] = [];
  historialCobros: any[] = [];
  nombreCliente?: string = '';
  constructor(
    private route: ActivatedRoute,
    private prestamoService: PrestamoService,
    private tipoPrestamoService: TipoPrestamoService,
    private location: Location,
    private cobroService: CobroService,
    private sucursalContextService: SucursalContextService,  
  ) {}

  ngOnInit(): void {
    this.cargarTiposPrestamo();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
    const nombreCliente = params.get('nombre_cliente') || '';
      if (id) {
        this.prestamoId = +id;
        this.loadPrestamo(this.prestamoId);
        this.cargarHistorialCobros(this.prestamoId);
      }
    });
  }

  cargarHistorialCobros(prestamoId: number) {
    console.log('Cargando historial de cobros para prestamoId:', prestamoId);
    this.cobroService.gethistorialcobros(prestamoId).subscribe({
      next: (data: any) => {
        this.historialCobros = data;
        console.log('Historial de cobros cargado:', this.historialCobros);
      },
      error: (err: any) => {
        console.error('Error cargando historial de cobros', err);
      }
    });
  }
    
  cargarTiposPrestamo() {
      const idSucursal = this.sucursalContextService.getSucursalId();
    if (!idSucursal) return;
    
    this.tipoPrestamoService.getTiposPrestamo(idSucursal).subscribe(data => {
      // Normalizamos los datos para asegurar que tengan id_tipo_prestamo
      this.tiposPrestamo = data.map((t: any) => {
        if (!t.id_tipo_prestamo) {
           t.id_tipo_prestamo = t.id || t.Id || t.tipo_prestamo_id;
        }
        return t;
      });
      console.log('TiposPrestamo loaded (normalized):', this.tiposPrestamo);
    });
  }

  // Helper para comparar objetos en el select y que se preseleccione correctamente el valor
  compareTipos(t1: any, t2: any): boolean {
    return t1 && t2 ? t1 === t2 : t1 === t2;
  }

  loadPrestamo(id: number) {
    this.prestamoService.getPrestamoInfoById(id).subscribe({
      next: (data) => {
        this.prestamo = data;
        if (this.prestamo) {
          // Convertir strings numéricos a números para inputs type="number"
          this.prestamo.monto_prestamo = Number(this.prestamo.monto_prestamo);
          this.prestamo.saldo_pendiente = Number(this.prestamo.saldo_pendiente);
          this.prestamo.valor_intereses = Number(this.prestamo.valor_intereses);
          this.prestamo.valor_cuota = Number(this.prestamo.valor_cuota);
          this.prestamo.nombre_cliente = this.prestamo.cliente; 
          console.log('Préstamo cargado:', this.prestamo); 
          // Convertir fechas
          if (this.prestamo.fecha_desembolso) {
            this.prestamo.fecha_desembolso = new Date(this.prestamo.fecha_desembolso);
          }
          if (this.prestamo.fecha_fin_prestamo) {
            this.prestamo.fecha_fin_prestamo = new Date(this.prestamo.fecha_fin_prestamo);
          }
        }
      },
      error: (err) => {
        console.error('Error cargando préstamo', err);
      }
    });
  }

  guardar() {
    if (this.prestamo && this.prestamoId) {
      console.log('Guardando préstamo:', this.prestamo);
      this.prestamoService.updatePrestamo(this.prestamoId, this.prestamo).subscribe({
        next: () => {
          alert('Préstamo actualizado correctamente');
          this.goBack();
        },
        error: (err) => {
          console.error('Error actualizando préstamo', err);
          alert('Error al actualizar el préstamo');
        }
      });
    }
  }
  

  goBack() {
    this.location.back();
  }

  
  limpiarCero(event: any) {
    if (this.prestamo && this.prestamo.monto_prestamo === 0) {
      this.prestamo.monto_prestamo = null as any;
    }
  }

  validarVacio() {
    if (this.prestamo && (this.prestamo.monto_prestamo === null || (this.prestamo.monto_prestamo as any) === '')) {
      this.prestamo.monto_prestamo = 0;
    }
  }
  generarPDF() {
  if (!this.prestamo) return;

  const doc = new jsPDF();
  const p = this.prestamo;
  const nombreFinal = p.nombre_cliente || this.nombreCliente  || 'Cliente';

  // --- 1. ENCABEZADO Y TÍTULO ---
  doc.setFillColor(33, 150, 243); // Azul Primario (Material)
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('ESTADO DE CUENTA', 14, 20);
  doc.setFontSize(12);
  doc.text(`Crédito ID: #${p.prestamo_id}`, 14, 30);

  // --- 2. INFORMACIÓN DEL CLIENTE Y RESUMEN ---
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMACIÓN DEL CLIENTE', 14, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nombre: ${nombreFinal}`, 14, 55);
  doc.text(`Fecha Desembolso: ${p.fecha_desembolso ? new Date(p.fecha_desembolso).toLocaleDateString() : 'N/A'}`, 14, 60);

  // Cuadro de Resumen Financiero (Derecha)
  doc.setDrawColor(200, 200, 200);
  doc.rect(120, 45, 75, 25);
  doc.text('SALDO PENDIENTE:', 125, 52);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${Number(p.saldo_pendiente).toLocaleString()}`, 125, 62);

  // --- 3. TABLA DE HISTORIAL DE COBROS ---
  doc.setFontSize(12);
  doc.text('DETALLE DE MOVIMIENTOS', 14, 80);

  const columns = ['Fecha de Pago', 'Monto Cobrado', 'Estado'];
  const data = this.historialCobros.map(c => [
    new Date(c.fecha).toLocaleDateString(),
    `$${Number(c.monto).toLocaleString()}`,
    c.estado.toUpperCase()
  ]);

  autoTable(doc, {
    startY: 85,
    head: [columns],
    body: data,
    theme: 'striped',
    headStyles: { fillColor: [52, 58, 64], textColor: [255, 255, 255], halign: 'center' },
    columnStyles: {
      1: { halign: 'right' }, // Monto a la derecha
      2: { halign: 'center' } // Estado centrado
    },
    didParseCell: (data) => {
      // Opcional: Pintar el texto de estado
      if (data.column.index === 2 && data.cell.section === 'body') {
        const estado = data.cell.raw as string;
        if (estado.includes('MORA')) data.cell.styles.textColor = [220, 53, 69];
      }
    }
  });

  // --- 4. PIE DE PÁGINA ---
  const finalY = (doc as any).lastAutoTable.finalY || 100;
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('Este documento es un soporte informativo de los pagos realizados.', 14, finalY + 10);
  doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, finalY + 15);

  // --- 5. DESCARGAR ---
  doc.save(`Reporte_Credito_${p.prestamo_id}.pdf`);
}

}

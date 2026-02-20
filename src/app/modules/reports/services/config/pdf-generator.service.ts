// src/app/modules/reports/services/config/pdf-generator.service.ts
import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface PDFHeaderConfig {
  title: string;
  subtitle?: string;
  institutionName?: string;
  institutionLogo?: string;
  date?: Date;
}

export interface PDFTableColumn {
  header: string;
  dataKey: string;
  width?: number;
}

@Injectable({
  providedIn: 'root',
})
export class PdfGeneratorService {
  private readonly pageWidth = 210; // A4 width in mm
  private readonly pageHeight = 297; // A4 height in mm
  private readonly margin = 15;

  constructor() {}

  /**
   * Crear nuevo documento PDF
   */
  createDocument(orientation: 'portrait' | 'landscape' = 'portrait'): jsPDF {
    return new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4',
    });
  }

  /**
   * Agregar encabezado estándar
   */
  addHeader(doc: jsPDF, config: PDFHeaderConfig, startY: number = 15): number {
    let currentY = startY;

    // Logo (si existe)
    if (config.institutionLogo) {
      try {
        doc.addImage(config.institutionLogo, 'PNG', this.margin, currentY, 30, 30);
      } catch (error) {
        console.error('Error adding logo:', error);
      }
    }

    // Nombre de la institución
    if (config.institutionName) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(
        config.institutionName,
        config.institutionLogo ? this.margin + 35 : this.margin,
        currentY + 5,
      );
      currentY += 8;
    }

    // Título del reporte
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(config.title, config.institutionLogo ? this.margin + 35 : this.margin, currentY);
    currentY += 6;

    // Subtítulo
    if (config.subtitle) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(config.subtitle, config.institutionLogo ? this.margin + 35 : this.margin, currentY);
      currentY += 6;
    }

    // Fecha
    const dateText = config.date
      ? format(config.date, "dd 'de' MMMM 'de' yyyy", { locale: es })
      : format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Fecha de emisión: ${dateText}`,
      config.institutionLogo ? this.margin + 35 : this.margin,
      currentY,
    );
    currentY += 10;

    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(this.margin, currentY, this.pageWidth - this.margin, currentY);
    currentY += 5;

    return currentY;
  }

  /**
   * Agregar pie de página
   */
  addFooter(doc: jsPDF, pageNumber: number, totalPages: number): void {
    const footerY = this.pageHeight - 10;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);

    // Número de página
    doc.text(`Página ${pageNumber} de ${totalPages}`, this.pageWidth / 2, footerY, {
      align: 'center',
    });

    // Fecha y hora de generación
    const now = format(new Date(), 'dd/MM/yyyy HH:mm');
    doc.text(`Generado el ${now}`, this.pageWidth - this.margin, footerY, { align: 'right' });
  }

  /**
   * Agregar tabla al PDF
   */
  addTable(doc: jsPDF, columns: PDFTableColumn[], data: any[], startY: number = 60): number {
    autoTable(doc, {
      startY: startY,
      head: [columns.map((col) => col.header)],
      body: data.map((row) => columns.map((col) => row[col.dataKey] || '')),
      margin: { left: this.margin, right: this.margin },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [37, 99, 235], // Blue
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      columnStyles: this.getColumnStyles(columns),
    });

    // Retornar la posición Y después de la tabla
    return (doc as any).lastAutoTable.finalY + 10;
  }

  /**
   * Obtener estilos de columnas
   */
  private getColumnStyles(columns: PDFTableColumn[]): any {
    const styles: any = {};
    columns.forEach((col, index) => {
      if (col.width) {
        styles[index] = { cellWidth: col.width };
      }
    });
    return styles;
  }

  /**
   * Agregar texto simple
   */
  addText(
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    options?: {
      fontSize?: number;
      fontStyle?: 'normal' | 'bold' | 'italic';
      align?: 'left' | 'center' | 'right';
      color?: [number, number, number];
    },
  ): void {
    if (options?.fontSize) doc.setFontSize(options.fontSize);
    if (options?.fontStyle) doc.setFont('helvetica', options.fontStyle);
    if (options?.color) doc.setTextColor(...options.color);

    doc.text(text, x, y, { align: options?.align || 'left' });

    // Reset defaults
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
  }

  /**
   * Agregar sección con título
   */
  addSection(doc: jsPDF, title: string, y: number): number {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(title, this.margin, y);

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');

    return y + 7;
  }

  /**
   * Agregar lista de items
   */
  addList(doc: jsPDF, items: string[], startY: number, bulletChar: string = '•'): number {
    let currentY = startY;
    doc.setFontSize(10);

    items.forEach((item) => {
      doc.text(`${bulletChar} ${item}`, this.margin + 5, currentY);
      currentY += 6;
    });

    return currentY + 3;
  }

  /**
   * Agregar estadísticas en formato de tarjetas
   */
  addStatsCards(
    doc: jsPDF,
    stats: Array<{ label: string; value: string | number; color?: string }>,
    startY: number,
  ): number {
    const cardWidth = (this.pageWidth - 2 * this.margin - 10) / 3;
    const cardHeight = 20;
    let currentX = this.margin;
    let currentY = startY;

    stats.forEach((stat, index) => {
      if (index > 0 && index % 3 === 0) {
        currentY += cardHeight + 5;
        currentX = this.margin;
      }

      // Fondo de la tarjeta
      const color = stat.color || '#2563eb';
      const rgb = this.hexToRgb(color);
      doc.setFillColor(rgb.r, rgb.g, rgb.b);
      doc.roundedRect(currentX, currentY, cardWidth, cardHeight, 3, 3, 'F');

      // Etiqueta
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(stat.label, currentX + 5, currentY + 8);

      // Valor
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(stat.value.toString(), currentX + 5, currentY + 15);
      doc.setFont('helvetica', 'normal');

      currentX += cardWidth + 5;
    });

    doc.setTextColor(0, 0, 0);
    return currentY + cardHeight + 10;
  }

  /**
   * Convertir hex a RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }

  /**
   * Guardar PDF
   */
  savePDF(doc: jsPDF, filename: string): void {
    doc.save(filename);
  }

  /**
   * Obtener PDF como Blob
   */
  getPDFBlob(doc: jsPDF): Blob {
    return doc.output('blob');
  }

  /**
   * Obtener PDF como Data URL
   */
  getPDFDataUrl(doc: jsPDF): string {
    return doc.output('dataurlstring');
  }

  /**
   * Imprimir PDF
   */
  printPDF(doc: jsPDF): void {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url);

    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }

  /**
   * Agregar marca de agua
   */
  addWatermark(doc: jsPDF, text: string): void {
    const pageCount = doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.saveGraphicsState();
      doc.setGState(new (doc as any).GState({ opacity: 0.1 }));
      doc.setFontSize(60);
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'bold');

      // Rotar y centrar el texto
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.text(text, pageWidth / 2, pageHeight / 2, {
        align: 'center',
        angle: 45,
      });

      doc.restoreGraphicsState();
    }
  }

  /**
   * Generar reporte de acceso
   */
  generateAccessReport(data: {
    headerConfig: PDFHeaderConfig;
    stats: any;
    accessRecords: any[];
  }): jsPDF {
    const doc = this.createDocument();
    let currentY = this.addHeader(doc, data.headerConfig);

    // Estadísticas
    currentY = this.addSection(doc, 'Resumen de Accesos', currentY);
    currentY = this.addStatsCards(
      doc,
      [
        { label: 'Total Ingresos', value: data.stats.totalEntries, color: '#10b981' },
        { label: 'Total Salidas', value: data.stats.totalExits, color: '#ef4444' },
        { label: 'Actualmente Dentro', value: data.stats.currentlyInside, color: '#3b82f6' },
      ],
      currentY,
    );

    // Tabla de registros
    currentY = this.addSection(doc, 'Detalle de Accesos', currentY);

    const columns: PDFTableColumn[] = [
      { header: 'Estudiante', dataKey: 'studentName' },
      { header: 'Código', dataKey: 'studentCode' },
      { header: 'Tipo', dataKey: 'type' },
      { header: 'Hora', dataKey: 'time' },
      { header: 'Ubicación', dataKey: 'location' },
    ];

    this.addTable(doc, columns, data.accessRecords, currentY);

    // Agregar pie de página a todas las páginas
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      this.addFooter(doc, i, pageCount);
    }

    return doc;
  }

  /**
   * Generar credencial de estudiante
   */
  generateStudentCard(student: {
    photo?: string;
    code: string;
    name: string;
    grade: string;
    section: string;
    qrCode: string;
  }): jsPDF {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [85.6, 54], // ID card size
    });

    // Fondo
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 85.6, 15, 'F');

    // Título
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CREDENCIAL ESTUDIANTIL', 42.8, 8, { align: 'center' });

    // Foto del estudiante
    if (student.photo) {
      try {
        doc.addImage(student.photo, 'JPEG', 5, 18, 25, 30);
      } catch (error) {
        console.error('Error adding photo:', error);
      }
    }

    // Información del estudiante
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Código:', 35, 22);
    doc.setFont('helvetica', 'normal');
    doc.text(student.code, 50, 22);

    doc.setFont('helvetica', 'bold');
    doc.text('Nombre:', 35, 28);
    doc.setFont('helvetica', 'normal');
    doc.text(student.name, 35, 33, { maxWidth: 45 });

    doc.setFont('helvetica', 'bold');
    doc.text('Grado:', 35, 39);
    doc.setFont('helvetica', 'normal');
    doc.text(`${student.grade} - ${student.section}`, 48, 39);

    // Código QR
    if (student.qrCode) {
      try {
        doc.addImage(student.qrCode, 'PNG', 58, 18, 22, 22);
      } catch (error) {
        console.error('Error adding QR code:', error);
      }
    }

    return doc;
  }
}

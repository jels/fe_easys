import { Injectable } from '@angular/core';

interface Secciones {
  id: number;
  componente: any;
  ubicacion: number;
  default: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class OrderArrayService {
  // Función genérica para ordenar arrays
  sortArray<T>(array: T[]): T[] {
    return [...array].sort((a, b) => {
      if (typeof a === 'number' && typeof b === 'number') {
        return a - b; // Orden numérico
      }
      return String(a).localeCompare(String(b)); // Orden alfabético
    });
  }

  // Función para ordenar arrays de objetos por una propiedad
  sortArrayByProperty<T>(array: T[], property: keyof T): T[] {
    return [...array].sort((a, b) => {
      const valueA = a[property];
      const valueB = b[property];

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return valueA - valueB; // Orden numérico
      }
      return String(valueA).localeCompare(String(valueB)); // Orden alfabético
    });
  }
  // Función para filtrar y ordenar
  // Función para combinar y ordenar
  combineAndSortSections(secciones: Secciones[]): Secciones[] {
    const defaultTrue = secciones.filter((seccion) => seccion.default);
    const defaultFalse = secciones.filter((seccion) => !seccion.default);

    defaultFalse.sort((a, b) => a.ubicacion - b.ubicacion);

    let result: Secciones[] = [];
    let defaultFalseIndex = 0;

    for (const seccion of secciones) {
      if (seccion.default) {
        result.push(seccion);
      } else {
        result.push(defaultFalse[defaultFalseIndex]);
        defaultFalseIndex++;
      }
    }

    return result;
  }
}

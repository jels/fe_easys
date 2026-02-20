import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatogs',
  standalone: true,
})
export class FormatogsPipe implements PipeTransform {
  transform(value: number): string {
    if (!value && value !== 0) {
      return '';
    }

    // Convierte el número en una cadena y añade los puntos
    let formattedNumber = value
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Añade ' Gs' al final del número
    return `${formattedNumber} Gs`;
  }
}

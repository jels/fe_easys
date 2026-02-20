import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({
  name: 'fecha',
  standalone: true,
})
export class FechaPipe implements PipeTransform {
  transform(value: string, format: string): string {
    if (!value) {
      return '';
    }

    const dateParts = value.split('-');
    const day = dateParts[0];
    const month = dateParts[1];
    const year = dateParts[2];

    const date = new Date(`${year}-${month}-${day}T00:00:00.000`);

    if (format === "yyyy-MM-dd'T'HH:mm:ss.SSS") {
      return formatDate(date, format, 'es-PY');
    } else {
      return `${day}/${month}/${year}`;
    }
  }
}

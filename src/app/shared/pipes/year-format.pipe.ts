import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'yearFormat',
})
export class YearFormatPipe implements PipeTransform {
  transform(value: any): string {
    if (value == null) return '';
    // Asegúrate de que sea un número entero
    const year = parseInt(value, 10);
    return isNaN(year) ? '' : year.toString();
  }
}

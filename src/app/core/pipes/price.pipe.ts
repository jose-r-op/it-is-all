import { Pipe, PipeTransform } from '@angular/core';
import { formatPrice } from '../utils/format-price';

@Pipe({ name: 'price', standalone: true })
export class PricePipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return formatPrice(value ?? 0);
  }
}


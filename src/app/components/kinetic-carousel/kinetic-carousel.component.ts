import { Component } from '@angular/core';

@Component({
  selector: 'app-kinetic-carousel',
  standalone: true,
  imports: [],
  templateUrl: './kinetic-carousel.component.html',
  styleUrl: './kinetic-carousel.component.scss'
})
export class KineticCarouselComponent {
  products = [
    { id: 1, number: '01', name: 'OVERSIZED HOOD', symbol: '✦' },
    { id: 2, number: '02', name: 'DARKWEAR CARGO', symbol: '☩' },
    { id: 3, number: '03', name: 'SIGIL ACCESSORIES', symbol: '◈' },
    { id: 4, number: '04', name: 'CYBER GOTH VIBES', symbol: '▲' }
  ];

  lanes = [
    { id: 1, reverse: false },
    { id: 2, reverse: true },
    { id: 3, reverse: false },
    { id: 4, reverse: true }
  ];

  currentIndex = 0;

  get currentProduct() {
    return this.products[this.currentIndex];
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.products.length;
  }

  previous(): void {
    this.currentIndex =
      (this.currentIndex - 1 + this.products.length) % this.products.length;
  }
}
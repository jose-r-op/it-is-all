import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {
  @Output() explore = new EventEmitter<void>();
  @Output() manifesto = new EventEmitter<void>();

  onExplore(): void {
    this.explore.emit();
  }

  onManifesto(): void {
    this.manifesto.emit();
  }
}

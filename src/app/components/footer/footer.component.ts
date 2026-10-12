import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  @Output() navigate = new EventEmitter<string>();

  onNavigate(sectionId: string): void {
    this.navigate.emit(sectionId);
  }
}

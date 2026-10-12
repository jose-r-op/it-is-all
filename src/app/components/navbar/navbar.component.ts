import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  @Input() cartCount = 0;
  @Output() cartToggle = new EventEmitter<void>();
  @Output() navigate = new EventEmitter<string>();

  isMobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  onNavigate(sectionId: string): void {
    this.closeMobileMenu();
    this.navigate.emit(sectionId);
  }

  onCartClick(): void {
    this.closeMobileMenu();
    this.cartToggle.emit();
  }
}

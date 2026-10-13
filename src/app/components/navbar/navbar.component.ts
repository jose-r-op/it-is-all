import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  @Input() cartCount = 0;
  @Output() cartToggle = new EventEmitter<void>();
  @Output() navigate = new EventEmitter<string>();
  @Output() openAuth = new EventEmitter<void>();
  @Output() openAdmin = new EventEmitter<void>();

  authService = inject(AuthService);
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

  onAuthClick(): void {
    this.closeMobileMenu();
    this.openAuth.emit();
  }

  onAdminClick(): void {
    this.closeMobileMenu();
    this.openAdmin.emit();
  }

  onLogout(): void {
    this.authService.logout();
    this.closeMobileMenu();
  }
}

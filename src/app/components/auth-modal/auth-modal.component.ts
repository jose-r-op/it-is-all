import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.scss'
})
export class AuthModalComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() loginSuccess = new EventEmitter<void>();

  private authService = inject(AuthService);

  isLoginMode = true;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Form Fields
  fullName = '';
  email = '';
  password = '';
  phoneNumber = '';

  switchMode(isLogin: boolean): void {
    this.isLoginMode = isLogin;
    this.errorMessage = null;
    this.successMessage = null;
  }

  fillAdminCredentials(): void {
    this.isLoginMode = true;
    this.email = 'admin@itisall.com';
    this.password = 'Admin123*';
    this.errorMessage = null;
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor ingresa tu correo y contraseña.';
      return;
    }

    this.isLoading = true;

    if (this.isLoginMode) {
      this.authService.login({ email: this.email, password: this.password }).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.successMessage = `¡Bienvenido ${res.fullName}!`;
          setTimeout(() => {
            this.loginSuccess.emit();
            this.close.emit();
          }, 800);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err?.error?.message || 'Error al iniciar sesión. Revisa tus credenciales.';
        }
      });
    } else {
      if (!this.fullName) {
        this.isLoading = false;
        this.errorMessage = 'El nombre completo es requerido.';
        return;
      }

      this.authService.register({
        fullName: this.fullName,
        email: this.email,
        password: this.password,
        phoneNumber: this.phoneNumber
      }).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.successMessage = 'Cuenta creada exitosamente.';
          setTimeout(() => {
            this.loginSuccess.emit();
            this.close.emit();
          }, 800);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err?.error?.message || 'Error al crear la cuenta.';
        }
      });
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }
}

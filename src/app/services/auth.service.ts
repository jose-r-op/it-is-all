import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, throwError } from 'rxjs';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/auth';
  private tokenKey = 'it_is_all_token';
  private userKey = 'it_is_all_user';

  // Signals reactivos para el estado del usuario
  private currentUserSignal = signal<User | null>(this.getStoredUser());
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'Admin');

  constructor() {
    // Si hay token guardado pero no usuario, intentar recuperar
    const token = this.getToken();
    if (token && !this.currentUserSignal()) {
      const user = this.getStoredUser();
      if (user) {
        this.currentUserSignal.set(user);
      }
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem(this.userKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => this.handleAuthSuccess(res)),
      catchError(err => {
        // Fallback para modo offline / demo si la API no está encendida aún
        if (credentials.email === 'admin@itisall.com' && credentials.password === 'Admin123*') {
          const mockAdmin: AuthResponse = {
            id: 1,
            fullName: 'Administrador It Is All',
            email: 'admin@itisall.com',
            role: 'Admin',
            token: 'demo-admin-jwt-token-preview',
            expiresAt: new Date(Date.now() + 86400000).toISOString()
          };
          this.handleAuthSuccess(mockAdmin);
          return of(mockAdmin);
        }
        return throwError(() => err);
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSignal.set(null);
  }

  private handleAuthSuccess(res: AuthResponse): void {
    const user: User = {
      id: res.id,
      fullName: res.fullName,
      email: res.email,
      role: res.role,
      token: res.token
    };
    localStorage.setItem(this.tokenKey, res.token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }
}

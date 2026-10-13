import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private apiBaseUrl = 'http://localhost:5000/api';
  private localFallbackUrl = '/data/products.json';

  /**
   * Obtiene la lista completa de productos desde el backend C# (.NET 8).
   * Si la API está apagada, recurre automáticamente al archivo JSON local como respaldo.
   */
  getProducts(): Observable<Product[]> {
    return this.http.get<any[]>(`${this.apiBaseUrl}/products`).pipe(
      map(apiProducts => this.mapBackendProducts(apiProducts)),
      catchError(() => {
        // Respaldo en caso de que la API de C# / MySQL no esté levantada todavía
        return this.http.get<Product[]>(this.localFallbackUrl);
      })
    );
  }

  /**
   * Obtiene un producto por su ID
   */
  getProductById(id: number): Observable<Product | undefined> {
    return this.http.get<any>(`${this.apiBaseUrl}/products/${id}`).pipe(
      map(p => this.mapSingleProduct(p)),
      catchError(() => {
        return this.getProducts().pipe(
          map(products => products.find(p => p.id === id))
        );
      })
    );
  }

  /**
   * Crear un nuevo producto desde el panel de administración
   * Admite multipart/form-data con fotos adjuntas
   */
  createProduct(formData: FormData): Observable<Product> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token || ''}`
    });

    return this.http.post<any>(`${this.apiBaseUrl}/products`, formData, { headers }).pipe(
      map(res => this.mapSingleProduct(res))
    );
  }

  /**
   * Eliminar un producto (Solo Administradores)
   */
  deleteProduct(id: number): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token || ''}`
    });

    return this.http.delete(`${this.apiBaseUrl}/products/${id}`, { headers });
  }

  /**
   * Transforma los productos del backend al formato que consume el template de Angular
   */
  private mapBackendProducts(items: any[]): Product[] {
    return items.map(item => this.mapSingleProduct(item));
  }

  private mapSingleProduct(item: any): Product {
    // Si ya viene con la forma local, retornarlo
    if (item.symbol && item.tagline && !item.categoryName) {
      return item as Product;
    }

    const sizesArray = typeof item.sizes === 'string'
      ? item.sizes.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
      : (item.sizes || ['ÚNICA']);

    const isResale = item.origin === 'Resale' || item.origin === 1;
    const cover = item.coverImageUrl || (item.images && item.images.length > 0 ? item.images[0].imageUrl : undefined);

    // Ajustar URL si es relativa del backend
    const resolvedCover = cover && cover.startsWith('/uploads/')
      ? `http://localhost:5000${cover}`
      : cover;

    return {
      id: item.id,
      name: item.name,
      category: item.categoryName || 'GENERAL',
      price: item.price,
      compareAtPrice: item.compareAtPrice,
      badge: isResale ? 'REVENTA // CURADA' : 'IT IS ALL',
      tagline: item.description?.slice(0, 75) + '...',
      symbol: isResale ? '♲' : '✦',
      description: item.description,
      sizes: sizesArray.length > 0 ? sizesArray : ['S', 'M', 'L'],
      origin: isResale ? 'Resale' : 'ItIsAll',
      condition: item.condition,
      brand: item.brand,
      color: item.color,
      stock: item.stock,
      imageUrl: resolvedCover,
      coverImageUrl: resolvedCover,
      images: item.images?.map((img: any) => ({
        id: img.id,
        imageUrl: img.imageUrl?.startsWith('/uploads/') ? `http://localhost:5000${img.imageUrl}` : img.imageUrl,
        isCover: img.isCover
      })) || [],
      isFeatured: item.isFeatured
    };
  }
}

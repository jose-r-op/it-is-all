import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Inyección de dependencias moderna con inject() (Angular 16+)
  private http = inject(HttpClient);

  // URL del endpoint. Actualmente apunta a nuestro archivo JSON local.
  // Cuando tengas tu backend real, ¡solo cambiarás este string por 'https://mi-api.com/api/products'!
  private apiUrl = '/data/products.json';

  /**
   * Obtiene la lista completa de productos desde la API
   * Retorna un Observable con el array de prendas tipadas como Product[]
   */
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  /**
   * Obtiene un producto específico por su ID
   */
  getProductById(id: number): Observable<Product | undefined> {
    return this.getProducts().pipe(
      map(products => products.find(p => p.id === id))
    );
  }
}

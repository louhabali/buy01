import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private http = inject(HttpClient);

  private apiUrl = 'https://localhost:8089/products';


  // Get all products
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }


  // Get product by id
  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(
      `${this.apiUrl}/${id}`
    );
  }


  // Create product
  createProduct(formData: FormData): Observable<Product> {
    return this.http.post<Product>(
      this.apiUrl,
      formData
    );
  }


  // Update product
  updateProduct(
    id: string,
    formData: FormData
  ): Observable<Product> {

    return this.http.put<Product>(
      `${this.apiUrl}/${id}`,
      formData
    );

  }


  // Delete product
  deleteProduct(id: string): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );

  }

}
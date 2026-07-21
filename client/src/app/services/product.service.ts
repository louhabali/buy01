


import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Product } from '../models/product';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
 

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-User-Id': this.authService.getUserId() || '',
      'X-Role': this.authService.getRole() || 'CLIENT' 
    });
  }

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(environment.productUrl);
  }
    getProduct(id: string): Observable<Product> {
     return this.http.get<Product>(
       `${environment.productUrl}/${id}`
     );
   }
   getProductById(id: string): Observable<Product> {
    return this.getProduct(id);
  }


  createProduct(formData: FormData): Observable<Product> {
    // Angular handles Content-Type boundaries automatically when passing FormData
    return this.http.post<Product>(environment.productUrl, formData, {
      headers: this.getHeaders()
    });
  }

  updateProduct(id: string, formData: FormData): Observable<Product> {
    return this.http.put<Product>(`${environment.productUrl}/${id}`, formData, {
      headers: this.getHeaders()
    });
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.productUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
}

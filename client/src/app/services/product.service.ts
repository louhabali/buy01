import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Product } from '../models/product';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {

    return this.http.get<Product[]>(
      environment.productUrl
    );

  }

  getProduct(id: string): Observable<Product> {

    return this.http.get<Product>(
      `${environment.productUrl}/${id}`
    );

  }

  addProduct(form: FormData): Observable<Product> {

    return this.http.post<Product>(
      environment.productUrl,
      form
    );

  }

  updateProduct(id: string, form: FormData) {

    return this.http.put(
      `${environment.productUrl}/${id}`,
      form
    );

  }

  deleteProduct(id: string) {

    return this.http.delete(
      `${environment.productUrl}/${id}`
    );

  }

}
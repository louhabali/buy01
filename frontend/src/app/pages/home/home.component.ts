import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { Product } from '../../models/product';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ProductCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  private productService = inject(ProductService);

  products: Product[] = [];

  currentUserId: string = '';

  ngOnInit(): void {

    this.currentUserId = localStorage.getItem('username') || '';

    this.loadProducts();

  }

  loadProducts(): void {

    this.productService.getAllProducts().subscribe({

      next: (data) => {

        this.products = data;

      },

      error: (err) => {

        console.error('Error loading products', err);

      }

    });

  }

  deleteProduct(id: string): void {

    if (!confirm('Delete this product?')) {
      return;
    }

    this.productService.deleteProduct(id).subscribe({

      next: () => {

        console.log('Product deleted');

        this.loadProducts();

      },

      error: (err) => {

        console.error('Delete failed', err);

      }

    });

  }

}
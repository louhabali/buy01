import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Product } from '../../models/product';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {

  private productService = inject(ProductService);

  products: Product[] = [];

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  deleteProduct(id: string) {

    if (!confirm('Delete this product?')) {
      return;
    }

    this.productService.deleteProduct(id).subscribe({
      next: () => this.loadProducts(),
      error: (err) => console.log(err)
    });

  }

}
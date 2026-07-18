import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ProductService } from '../../core/services/product.service';
import { Product } from '../../models/product';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';


@Component({
  selector: 'app-products',
  standalone: true,

  imports: [
    CommonModule,
    RouterModule,
    // ProductCardComponent
  ],

  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})


export class ProductsComponent implements OnInit {


  private productService = inject(ProductService);


  products: Product[] = [];


  // currentUserId = localStorage.getItem('username') || '';
  ngOnInit(): void {

    this.loadProducts();

  }



  loadProducts(): void {


    this.productService.getAllProducts()
      .subscribe({

        next: (data) => {

          console.log(data);

          this.products = data;

        },


        error: (err) => {

          console.error(
            'Error loading products',
            err
          );

        }

      });


  }

  deleteProduct(id: string): void {


    const confirmDelete = confirm(
      'Delete this product?'
    );


    if (!confirmDelete) {
      return;
    }



    this.productService.deleteProduct(id)
      .subscribe({

        next: () => {

          console.log(
            'Product deleted'
          );

          this.loadProducts();

        },


        error: (err) => {

          console.error(
            'Delete error',
            err
          );

        }

      });


  }



}
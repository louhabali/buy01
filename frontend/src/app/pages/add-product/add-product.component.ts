import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export class AddProductComponent {

  private productService = inject(ProductService);
  private router = inject(Router);

  name = '';
  price = 0;

  selectedFiles: File[] = [];

  onFileSelected(event: any) {

    this.selectedFiles = Array.from(event.target.files);

  }

  saveProduct() {

    const formData = new FormData();

    formData.append('name', this.name);
    formData.append('price', this.price.toString());

    this.selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    this.productService.createProduct(formData).subscribe({

      next: () => {

        alert('Product added successfully');

        this.router.navigate(['/products']);

      },

      error: (err) => {

        console.log(err);

        alert('Error while adding product');

      }

    });

  }

}
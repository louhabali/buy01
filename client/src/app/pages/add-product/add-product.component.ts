import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './add-product.component.html'
})
export class AddProductComponent {
  private productService = inject(ProductService);
  private router = inject(Router);

  name = '';
  description = '';
  price = 0;
  quantity = 0;

  selectedFiles: File[] = [];
  previews: string[] = [];
  errorMessage = '';
  loading = false;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.errorMessage = '';
    this.selectedFiles = [];
    this.previews = [];

    const files: FileList = input.files;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith('image/')) {
        this.errorMessage += `"${file.name}" is not an image.\n`;
        continue;
      }

      if (file.size > 2 * 1024 * 1024) {
        this.errorMessage += `"${file.name}" exceeds 2MB limit.\n`;
        continue;
      }

      this.selectedFiles.push(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.previews.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  saveProduct(): void {
    if (!this.name || !this.description || this.price <= 0 || this.quantity < 0) {
      this.errorMessage = 'Name, description, price, and valid quantity are required.';
      return;
    }

    this.loading = true;
    const formData = new FormData();
    formData.append('name', this.name);
    formData.append('description', this.description);
    formData.append('price', this.price.toString());
    formData.append('quantity', this.quantity.toString());

    this.selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    this.productService.createProduct(formData).subscribe({
      next: () => {
        this.router.navigate(['/products']);
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.errorMessage = 'Failed to create product listing.';
      }
    });
  }
}
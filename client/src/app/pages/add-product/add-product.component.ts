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
  price: number | null = null;
  quantity: number | null = null;

  selectedFiles: File[] = [];
  previews: string[] = [];
  errorMessage = '';
  loading = false;

  // Clear top error message whenever user modifies fields
  onInputChange(): void {
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  // Restrict price input to 2 decimal places and max limits
  onPriceInput(event: Event): void {
    this.onInputChange();
    const input = event.target as HTMLInputElement;
    if (input.value && input.value.includes('.')) {
      const parts = input.value.split('.');
      if (parts[1].length > 2) {
        input.value = `${parts[0]}.${parts[1].slice(0, 2)}`;
        this.price = parseFloat(input.value);
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.errorMessage = '';
    const files: FileList = input.files;
    const fileErrors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith('image/')) {
        fileErrors.push(`"${file.name}" is not an image file.`);
        continue;
      }

      if (file.size > 2 * 1024 * 1024) {
        fileErrors.push(`"${file.name}" exceeds the 2MB size limit.`);
        continue;
      }

      this.selectedFiles.push(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.previews.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    if (fileErrors.length > 0) {
      this.errorMessage = fileErrors.join('\n');
    }

    // Clear input value so selecting the same file again works
    input.value = '';
  }

  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.previews.splice(index, 1);
    this.onInputChange();
  }

  saveProduct(): void {
    this.errorMessage = '';
    const errors: string[] = [];

    // Detailed field validation checks
    const trimmedName = this.name.trim();
    if (!trimmedName) {
      errors.push('Product title is required.');
    } else if (trimmedName.length < 3) {
      errors.push('Product title must be at least 3 characters.');
    } else if (trimmedName.length > 100) {
      errors.push('Product title cannot exceed 100 characters.');
    }

    const trimmedDesc = this.description.trim();
    if (!trimmedDesc) {
      errors.push('Description is required.');
    } else if (trimmedDesc.length < 10) {
      errors.push('Description must be at least 10 characters.');
    } else if (trimmedDesc.length > 1000) {
      errors.push('Description cannot exceed 1000 characters.');
    }

    if (this.price === null || this.price === undefined || isNaN(this.price)) {
      errors.push('Price is required.');
    } else if (this.price < 0.01) {
      errors.push('Price must be at least 0.01 DH.');
    } else if (this.price > 9999999.99) {
      errors.push('Price exceeds maximum allowed value (9,999,999.99 DH).');
    }

    if (this.quantity === null || this.quantity === undefined || isNaN(this.quantity)) {
      errors.push('Stock quantity is required.');
    } else if (this.quantity < 0) {
      errors.push('Stock quantity cannot be negative.');
    } else if (this.quantity > 999999) {
      errors.push('Stock quantity exceeds maximum limit (999,999).');
    }

    if (errors.length > 0) {
      this.errorMessage = errors.join('\n');
      return;
    }

    this.loading = true;
    const formData = new FormData();
    formData.append('name', trimmedName);
    formData.append('description', trimmedDesc);
    formData.append('price', this.price!.toString());
    formData.append('quantity', this.quantity!.toString());

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
        this.errorMessage = err?.error?.errorMessage || err?.error?.message || 'Failed to create product listing. Please try again.';
      }
    });
  }
}
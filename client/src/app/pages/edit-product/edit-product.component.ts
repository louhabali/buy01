import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit-product.component.html'
})
export class EditProductComponent implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id!: string;
  name = '';
  description = '';
  price = 0;
  quantity = 0;

  images: File[] = [];
  previews: string[] = [];
  existingImages: string[] = [];
  
  loading = true;
  saving = false;
  errorMessage = '';

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];

    this.productService.getProduct(this.id).subscribe({
      next: (product) => {
        this.name = product.name;
        this.description = product.description || '';
        this.price = product.price;
        this.quantity = product.quantity || 0;
        this.existingImages = product.imageUrls || [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load product details.';
        this.loading = false;
      }
    });
  }

  selectImages(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.images = Array.from(input.files);
    this.previews = [];

    this.images.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => this.previews.push(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  update(): void {
    if (!this.name || this.price <= 0) {
      this.errorMessage = 'Please provide a valid product name and price.';
      return;
    }

    this.saving = true;
    const form = new FormData();
    form.append('name', this.name);
    form.append('description', this.description);
    form.append('price', this.price.toString());
    form.append('quantity', this.quantity.toString());

    this.images.forEach((img) => {
      form.append('images', img);
    });

    this.productService.updateProduct(this.id, form).subscribe({
      next: () => {
        this.router.navigate(['/products']);
      },
      error: (err) => {
        console.error(err);
        this.saving = false;
        this.errorMessage = 'Error saving updates to server.';
      }
    });
  }
}
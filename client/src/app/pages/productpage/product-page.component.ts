import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-page.component.html'
})
export class ProductPageComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private location = inject(Location);

  product: Product | null = null;
  selectedImageIndex = 0;
  isLoading = true;
  isSaving = false;
  editing = false;
  isFullViewOpen = false;
  error: string | null = null;

  // New files selected during edit mode
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];

  // Reactive form for inline editing
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    quantity: [0, [Validators.required, Validators.min(0)]],
    description: ['', [Validators.required, Validators.minLength(10)]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchProduct(id);
    } else {
      this.error = 'Invalid Product ID';
      this.isLoading = false;
    }
  }

  get isOwner(): boolean {
    const currentUserId = this.authService.getUserId();
    const currentUserRole = this.authService.getRole();
    return currentUserRole === 'SELLER' && this.product?.userId === currentUserId;
  }

  fetchProduct(id: string): void {
    this.productService.getProduct(id).subscribe({
      next: (data) => {
        this.product = data;
        this.resetFormValues(data);
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Product not found';
        this.isLoading = false;
      }
    });
  }

  private resetFormValues(p: Product): void {
    this.form.patchValue({
      name: p.name,
      price: p.price,
      quantity: p.quantity,
      description: p.description
    });
    this.imagePreviews = p.imageUrls ? [...p.imageUrls] : [];
  }

  get currentImage(): string {
    if (this.imagePreviews.length > 0) {
      return this.imagePreviews[this.selectedImageIndex] || 'assets/placeholder-product.png';
    }
    return 'assets/placeholder-product.png';
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  prevImage(): void {
    if (!this.imagePreviews.length) return;
    this.selectedImageIndex = 
      (this.selectedImageIndex - 1 + this.imagePreviews.length) % this.imagePreviews.length;
  }

  nextImage(): void {
    if (!this.imagePreviews.length) return;
    this.selectedImageIndex = 
      (this.selectedImageIndex + 1) % this.imagePreviews.length;
  }

  // Toggle Inline Edit
  editProduct(): void {
    this.editing = true;
  }

  cancelEdit(): void {
    this.editing = false;
    this.selectedFiles = [];
    if (this.product) {
      this.resetFormValues(this.product);
    }
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.selectedFiles = Array.from(input.files);
    this.imagePreviews = [];

    // Local previews for selected images
    this.selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviews.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    });

    this.selectedImageIndex = 0;
  }

  saveProduct(): void {
    if (this.form.invalid || !this.product) return;
    this.isSaving = true;
    this.error = null;

    const values = this.form.getRawValue();
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('description', values.description);
    formData.append('price', values.price.toString());
    formData.append('quantity', values.quantity.toString());

    this.selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    this.productService.updateProduct(this.product.id!, formData).subscribe({
      next: (updatedProduct) => {
        this.product = updatedProduct;
        this.resetFormValues(updatedProduct);
        this.editing = false;
        this.isSaving = false;
        this.selectedFiles = [];
        this.selectedImageIndex = 0;
      },
      error: (err) => {
        this.error = err?.error?.errorMessage ?? 'Failed to update product details';
        this.isSaving = false;
      }
    });
  }

  onDelete(): void {
    if (!this.product) return;
    if (confirm(`Are you sure you want to delete "${this.product.name}"?`)) {
      this.productService.deleteProduct(this.product.id!).subscribe({
        next: () => this.router.navigate(['/products']),
        error: () => alert('Failed to delete product')
      });
    }
  }

  openFullImageView(): void {
    if (this.imagePreviews.length) this.isFullViewOpen = true;
  }

  closeFullImageView(): void {
    this.isFullViewOpen = false;
  }

  goBack(): void {
    this.location.back();
  }
}
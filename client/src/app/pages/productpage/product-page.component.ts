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
  isDeleting = false;
  editing = false;
  showDeleteModal = false;
  isFullViewOpen = false;
  error: string | null = null;

  // New files selected during edit mode
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];

  // Reactive form with strict length and value constraints
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    price: [0, [Validators.required, Validators.min(0.01), Validators.max(9999999.99)]],
    quantity: [0, [Validators.required, Validators.min(0), Validators.max(999999)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
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
      return this.imagePreviews[this.selectedImageIndex];
    
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

  // Prevent entering more than 2 decimal places for price
  onPriceInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value && input.value.includes('.')) {
      const parts = input.value.split('.');
      if (parts[1].length > 2) {
        input.value = `${parts[0]}.${parts[1].slice(0, 2)}`;
        this.form.get('price')?.setValue(parseFloat(input.value), { emitEvent: false });
      }
    }
  }

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
    formData.append('name', values.name.trim());
    formData.append('description', values.description.trim());
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

  openDeleteModal(): void {
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    if (!this.product) return;
    this.isDeleting = true;
    this.error = null;

    this.productService.deleteProduct(this.product.id!).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.error = err?.error?.errorMessage ?? 'Failed to delete product. Please try again.';
      }
    });
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

  downloadCurrentImage(): void {
    const imageUrl = this.currentImage;
    if (!imageUrl || imageUrl.includes('assets/placeholder')) return;

    const fileName = imageUrl.split('/uploads/').pop();
    if (!fileName) return;

    const downloadUrl = `https://localhost:8089/media/images/${fileName}/download`;

    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-page.component.html'
})
export class ProductPageComponent implements OnInit {
  product: Product | null = null;
  selectedImageIndex = 0;
  isLoading = true;
  error: string | null = null;

  // Edit Modal State
  isEditModalOpen = false;
  isSaving = false;
  selectedFiles: File[] = [];
  editForm = {
    name: '',
    description: '',
    price: 0,
    quantity: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private authService: AuthService,
    private location: Location
  ) {}

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
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Product not found';
        this.isLoading = false;
      }
    });
  }

  get currentImage(): string {
    if (this.product?.imageUrls && this.product.imageUrls.length > 0) {
      return this.product.imageUrls[this.selectedImageIndex] || 'assets/placeholder-product.png';
    }
    return 'assets/placeholder-product.png';
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  prevImage(): void {
    if (!this.product?.imageUrls?.length) return;
    this.selectedImageIndex = 
      (this.selectedImageIndex - 1 + this.product.imageUrls.length) % this.product.imageUrls.length;
  }

  nextImage(): void {
    if (!this.product?.imageUrls?.length) return;
    this.selectedImageIndex = 
      (this.selectedImageIndex + 1) % this.product.imageUrls.length;
  }

  openEditModal(): void {
    if (!this.product) return;
    this.editForm = {
      name: this.product.name,
      description: this.product.description,
      price: this.product.price,
      quantity: this.product.quantity
    };
    this.selectedFiles = [];
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  onSaveEdit(): void {
    if (!this.product) return;
    this.isSaving = true;

    const formData = new FormData();
    formData.append('name', this.editForm.name);
    formData.append('description', this.editForm.description);
    formData.append('price', this.editForm.price.toString());
    formData.append('quantity', this.editForm.quantity.toString());

    this.selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    this.productService.updateProduct(this.product.id!, formData).subscribe({
      next: (updatedProduct) => {
        this.product = updatedProduct;
        this.selectedImageIndex = 0;
        this.isSaving = false;
        this.closeEditModal();
      },
      error: () => {
        alert('Failed to update product');
        this.isSaving = false;
      }
    });
  }

  onDelete(): void {
    if (!this.product) return;
    if (confirm(`Are you sure you want to delete "${this.product.name}"?`)) {
      this.productService.deleteProduct(this.product.id!).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: () => alert('Failed to delete product')
      });
    }
  }

  goBack(): void {
    this.location.back();
  }
}
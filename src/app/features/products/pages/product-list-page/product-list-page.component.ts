import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ApiError } from '../../../../core/models/api-error.model';
import { ProductRecordLimit } from '../../components/product-record-limit/product-record-limit.component';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-list-page',
  templateUrl: './product-list-page.component.html',
  styleUrls: ['./product-list-page.component.scss']
})
export class ProductListPageComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  searchTerm = '';
  recordLimit: ProductRecordLimit = 5;
  isLoading = false;
  errorMessage = '';

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly productService: ProductService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get filteredProducts(): Product[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.products;
    }

    return this.products.filter((product) =>
      [product.id, product.name, product.description]
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }

  get visibleProducts(): Product[] {
    return this.filteredProducts.slice(0, this.recordLimit);
  }

  get totalLabel(): string {
    return `${this.filteredProducts.length} Resultado${
      this.filteredProducts.length === 1 ? '' : 's'
    }`;
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getProducts().pipe(takeUntil(this.destroy$)).subscribe({
      next: (products) => {
        this.products = products;
        this.isLoading = false;
      },
      error: (error: ApiError) => {
        this.errorMessage = error.message;
        this.products = [];
        this.isLoading = false;
      }
    });
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
  }

  onLimitChange(limit: ProductRecordLimit): void {
    this.recordLimit = limit;
  }

  goToCreate(): void {
    void this.router.navigate(['/products/new']);
  }

  goToEdit(id: string): void {
    void this.router.navigate(['/products', id, 'edit']);
  }
}

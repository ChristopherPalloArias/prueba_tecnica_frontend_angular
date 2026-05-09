import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ApiError } from '../../../../core/models/api-error.model';
import { ProductFormMode, ProductFormValue } from '../../models/product-form.model';
import { ProductRequest } from '../../models/product-request.model';
import { ProductService } from '../../services/product.service';
import { addOneYear, releaseDateValidator, revisionDateMatchesReleaseValidator } from '../../validators/product-date.validator';
import { productIdAvailableValidator } from '../../validators/product-id.validator';

@Component({
  selector: 'app-product-form-page',
  templateUrl: './product-form-page.component.html',
  styleUrls: ['./product-form-page.component.scss']
})
export class ProductFormPageComponent implements OnInit, OnDestroy {
  form: FormGroup;
  mode: ProductFormMode = 'create';
  isLoading = false;
  isSaving = false;
  loadError = '';
  submitError = '';

  private readonly destroy$ = new Subject<void>();
  private productId = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly productService: ProductService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    this.watchReleaseDate();

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.mode = 'edit';
      this.productId = id;
      this.prepareEditMode();
      this.loadProduct(id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save(): void {
    this.form.markAllAsTouched();
    this.submitError = '';

    if (this.form.invalid || this.form.pending) {
      return;
    }

    this.isSaving = true;
    const payload = this.toRequest(this.form.getRawValue() as ProductFormValue);
    const request$ =
      this.mode === 'edit'
        ? this.productService.updateProduct(this.productId, payload)
        : this.productService.createProduct(payload);

    request$.subscribe({
      next: () => {
        this.isSaving = false;
        void this.router.navigate(['/products']);
      },
      error: (error: ApiError) => {
        this.submitError = error.message;
        this.isSaving = false;
      }
    });
  }

  resetForm(): void {
    if (this.mode === 'edit' && this.productId) {
      this.loadProduct(this.productId);
      return;
    }

    this.form.reset({
      id: '',
      name: '',
      description: '',
      logo: '',
      date_release: '',
      date_revision: ''
    });
  }

  goBack(): void {
    void this.router.navigate(['/products']);
  }

  private createForm(): FormGroup {
    return this.formBuilder.group(
      {
        id: [
          '',
          [Validators.required, Validators.minLength(3), Validators.maxLength(10)],
          [productIdAvailableValidator(this.productService)]
        ],
        name: [
          '',
          [Validators.required, Validators.minLength(5), Validators.maxLength(100)]
        ],
        description: [
          '',
          [Validators.required, Validators.minLength(10), Validators.maxLength(200)]
        ],
        logo: ['', [Validators.required]],
        date_release: ['', [Validators.required, releaseDateValidator()]],
        date_revision: ['', [Validators.required]]
      },
      {
        validators: [revisionDateMatchesReleaseValidator()]
      }
    );
  }

  private watchReleaseDate(): void {
    this.form
      .get('date_release')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value: string | null) => {
        const revision = value ? addOneYear(value) : '';
        this.form.get('date_revision')?.setValue(revision, { emitEvent: false });
        this.form.updateValueAndValidity({ emitEvent: false });
      });
  }

  private prepareEditMode(): void {
    const idControl = this.form.get('id');
    idControl?.clearAsyncValidators();
    idControl?.disable({ emitEvent: false });
    idControl?.updateValueAndValidity({ emitEvent: false });
  }

  private loadProduct(id: string): void {
    this.isLoading = true;
    this.loadError = '';
    this.submitError = '';

    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.form.reset({
          id: product.id,
          name: product.name,
          description: product.description,
          logo: product.logo,
          date_release: product.date_release,
          date_revision: product.date_revision
        });
        this.form.get('id')?.disable({ emitEvent: false });
        this.isLoading = false;
      },
      error: (error: ApiError) => {
        this.loadError = error.message;
        this.isLoading = false;
      }
    });
  }

  private toRequest(value: ProductFormValue): ProductRequest {
    return {
      id: value.id,
      name: value.name,
      description: value.description,
      logo: value.logo,
      date_release: value.date_release,
      date_revision: value.date_revision
    };
  }
}

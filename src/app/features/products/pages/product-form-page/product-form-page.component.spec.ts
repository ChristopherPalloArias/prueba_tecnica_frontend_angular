import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { convertToParamMap, ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { ProductsModule } from '../../products.module';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { addOneYear, formatDateInput } from '../../validators/product-date.validator';
import { ProductFormPageComponent } from './product-form-page.component';

@Component({ template: '' })
class DummyRouteComponent {}

describe('ProductFormPageComponent', () => {
  let fixture: ComponentFixture<ProductFormPageComponent>;
  let component: ProductFormPageComponent;
  let productService: jasmine.SpyObj<ProductService>;
  let router: Router;

  const today = formatDateInput(new Date());
  const product: Product = {
    id: 'uno',
    name: 'Producto Uno',
    description: 'Descripcion del producto uno',
    logo: 'https://example.com/one.png',
    date_release: today,
    date_revision: addOneYear(today)
  };

  async function configureRoute(id?: string): Promise<void> {
    productService = jasmine.createSpyObj<ProductService>('ProductService', [
      'verifyProductId',
      'createProduct',
      'updateProduct',
      'getProductById'
    ]);
    productService.verifyProductId.and.returnValue(of(false));
    productService.createProduct.and.returnValue(of(product));
    productService.updateProduct.and.returnValue(of(product));
    productService.getProductById.and.returnValue(of(product));

    await TestBed.configureTestingModule({
      declarations: [DummyRouteComponent],
      imports: [
        ProductsModule,
        RouterTestingModule.withRoutes([
          { path: 'products', component: DummyRouteComponent }
        ])
      ],
      providers: [
        { provide: ProductService, useValue: productService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap(id ? { id } : {})
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create a valid create form and calculate revision date', async () => {
    await configureRoute();
    fixture.detectChanges();
    disableIdAsyncValidator();

    component.form.patchValue({
      id: 'abc',
      name: 'Producto Valido',
      description: 'Descripcion valida para el producto',
      logo: 'https://example.com/logo.png',
      date_release: today
    });
    await fixture.whenStable();

    expect(component.form.get('date_revision')?.value).toBe(addOneYear(today));
    expect(component.form.valid).toBeTrue();
  });

  it('should create product and navigate to list', async () => {
    await configureRoute();
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
    fixture.detectChanges();
    disableIdAsyncValidator();

    component.form.setValue({
      id: 'abc',
      name: 'Producto Valido',
      description: 'Descripcion valida para el producto',
      logo: 'https://example.com/logo.png',
      date_release: today,
      date_revision: addOneYear(today)
    });
    await fixture.whenStable();
    component.save();

    expect(productService.createProduct).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/products']);
  });

  it('should load product in edit mode and disable id field', async () => {
    await configureRoute('uno');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.mode).toBe('edit');
    expect(productService.getProductById).toHaveBeenCalledWith('uno');
    expect(component.form.get('id')?.disabled).toBeTrue();
    expect(component.form.getRawValue().id).toBe('uno');
  });

  it('should update product in edit mode', async () => {
    await configureRoute('uno');
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
    fixture.detectChanges();
    await fixture.whenStable();

    component.form.patchValue({
      name: 'Producto Editado',
      description: 'Descripcion editada valida'
    });
    component.save();

    expect(productService.updateProduct).toHaveBeenCalledWith(
      'uno',
      jasmine.objectContaining({ id: 'uno', name: 'Producto Editado' })
    );
    expect(navigateSpy).toHaveBeenCalledWith(['/products']);
  });

  it('should show submit error when backend rejects save', async () => {
    await configureRoute();
    productService.createProduct.and.returnValue(
      throwError(() => ({ message: 'No se pudo crear' }))
    );
    fixture.detectChanges();
    disableIdAsyncValidator();

    component.form.setValue({
      id: 'abc',
      name: 'Producto Valido',
      description: 'Descripcion valida para el producto',
      logo: 'https://example.com/logo.png',
      date_release: today,
      date_revision: addOneYear(today)
    });
    await fixture.whenStable();
    component.save();

    expect(component.submitError).toBe('No se pudo crear');
  });

  it('should not save when form is invalid', async () => {
    await configureRoute();
    fixture.detectChanges();
    disableIdAsyncValidator();

    component.save();

    expect(productService.createProduct).not.toHaveBeenCalled();
  });

  it('should reset form to empty values in create mode', async () => {
    await configureRoute();
    fixture.detectChanges();
    disableIdAsyncValidator();

    component.form.patchValue({ name: 'Changed' });
    component.resetForm();

    expect(component.form.get('name')?.value).toBe('');
  });

  it('should reload product when resetting in edit mode', async () => {
    await configureRoute('uno');
    fixture.detectChanges();
    await fixture.whenStable();

    component.form.patchValue({ name: 'Changed' });
    component.resetForm();

    expect(productService.getProductById).toHaveBeenCalledTimes(2);
  });

  it('should navigate back to product list', async () => {
    await configureRoute();
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
    fixture.detectChanges();

    component.goBack();

    expect(navigateSpy).toHaveBeenCalledWith(['/products']);
  });

  it('should set loadError when product load fails in edit mode', async () => {
    await configureRoute('uno');
    productService.getProductById.and.returnValue(
      throwError(() => ({ message: 'Producto no encontrado' }))
    );
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.loadError).toBe('Producto no encontrado');
  });

  function disableIdAsyncValidator(): void {
    const idControl = component.form.get('id');
    idControl?.clearAsyncValidators();
    idControl?.updateValueAndValidity();
  }
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { ProductsModule } from '../../products.module';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { ProductListPageComponent } from './product-list-page.component';

describe('ProductListPageComponent', () => {
  let fixture: ComponentFixture<ProductListPageComponent>;
  let component: ProductListPageComponent;
  let productService: jasmine.SpyObj<ProductService>;
  let router: Router;

  const products: Product[] = [
    {
      id: 'uno',
      name: 'Producto Uno',
      description: 'Descripcion del producto uno',
      logo: 'https://example.com/one.png',
      date_release: '2026-05-09',
      date_revision: '2027-05-09'
    },
    {
      id: 'dos',
      name: 'Producto Dos',
      description: 'Descripcion del producto dos',
      logo: 'https://example.com/two.png',
      date_release: '2026-06-01',
      date_revision: '2027-06-01'
    }
  ];

  beforeEach(async () => {
    productService = jasmine.createSpyObj<ProductService>('ProductService', [
      'getProducts'
    ]);
    productService.getProducts.and.returnValue(of(products));

    await TestBed.configureTestingModule({
      imports: [ProductsModule, RouterTestingModule],
      providers: [{ provide: ProductService, useValue: productService }]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should load products on init', () => {
    fixture.detectChanges();

    expect(productService.getProducts).toHaveBeenCalled();
    expect(component.products).toEqual(products);
    expect(component.visibleProducts.length).toBe(2);
  });

  it('should filter products client-side by search term', () => {
    fixture.detectChanges();

    component.onSearchChange('dos');

    expect(component.filteredProducts).toEqual([products[1]]);
  });

  it('should apply visual record limit without backend pagination', () => {
    productService.getProducts.and.returnValue(
      of([...products, { ...products[0], id: 'tres' }])
    );
    fixture = TestBed.createComponent(ProductListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.onLimitChange(5);
    expect(component.visibleProducts.length).toBe(3);

    component.onLimitChange(10);
    expect(productService.getProducts).toHaveBeenCalledTimes(1);
  });

  it('should show API errors visually', () => {
    productService.getProducts.and.returnValue(
      throwError(() => ({ message: 'No se pudo cargar' }))
    );
    fixture = TestBed.createComponent(ProductListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.errorMessage).toBe('No se pudo cargar');
  });

  it('should navigate to create and edit routes', () => {
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
    fixture.detectChanges();

    component.goToCreate();
    expect(navigateSpy).toHaveBeenCalledWith(['/products/new']);

    component.goToEdit('uno');
    expect(navigateSpy).toHaveBeenCalledWith(['/products', 'uno', 'edit']);
  });
});

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { Product } from '../models/product.model';
import { ProductRequest } from '../models/product-request.model';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/bp/products`;
  const product: Product = {
    id: 'uno',
    name: 'Producto Uno',
    description: 'Descripcion valida',
    logo: 'https://example.com/logo.png',
    date_release: '2026-05-09',
    date_revision: '2027-05-09'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch products from wrapped backend responses', () => {
    service.getProducts().subscribe((products) => {
      expect(products).toEqual([product]);
    });

    const request = httpMock.expectOne(baseUrl);
    expect(request.request.method).toBe('GET');
    request.flush({ data: [product] });
  });

  it('should fetch a product by id', () => {
    service.getProductById(product.id).subscribe((response) => {
      expect(response).toEqual(product);
    });

    const request = httpMock.expectOne(`${baseUrl}/${product.id}`);
    expect(request.request.method).toBe('GET');
    request.flush({ data: product });
  });

  it('should verify product id existence', () => {
    service.verifyProductId(product.id).subscribe((exists) => {
      expect(exists).toBeTrue();
    });

    const request = httpMock.expectOne(`${baseUrl}/verification/${product.id}`);
    expect(request.request.method).toBe('GET');
    request.flush(true);
  });

  it('should create a product', () => {
    const payload: ProductRequest = { ...product };

    service.createProduct(payload).subscribe((response) => {
      expect(response).toEqual(product);
    });

    const request = httpMock.expectOne(baseUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ data: product });
  });

  it('should update a product', () => {
    const payload: ProductRequest = { ...product, name: 'Producto Editado' };

    service.updateProduct(product.id, payload).subscribe((response) => {
      expect(response.name).toBe('Producto Editado');
    });

    const request = httpMock.expectOne(`${baseUrl}/${product.id}`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(payload);
    request.flush({ data: payload });
  });

  it('should normalize backend errors', () => {
    service.getProducts().subscribe({
      next: () => fail('Expected request to fail'),
      error: (error) => {
        expect(error.status).toBe(500);
        expect(error.message).toBe('Backend error');
      }
    });

    const request = httpMock.expectOne(baseUrl);
    request.flush({ message: 'Backend error' }, { status: 500, statusText: 'Error' });
  });
});

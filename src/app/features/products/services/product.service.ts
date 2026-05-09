import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

import { ApiError } from '../../../core/models/api-error.model';
import { environment } from '../../../../environments/environment';
import { Product, ProductApiResponse } from '../models/product.model';
import { ProductRequest } from '../models/product-request.model';

type ProductCollectionResponse = Product[] | ProductApiResponse<Product[]>;
type ProductItemResponse = Product | ProductApiResponse<Product>;
type VerificationResponse = boolean | ProductApiResponse<boolean>;

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly baseUrl = `${environment.apiUrl}/bp/products`;

  constructor(private readonly http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<ProductCollectionResponse>(this.baseUrl).pipe(
      map((response) => this.normalizeProductCollection(response)),
      catchError((error: HttpErrorResponse) =>
        throwError(() =>
          this.toApiError(error, 'No se pudo cargar el listado de productos.')
        )
      )
    );
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<ProductItemResponse>(`${this.baseUrl}/${id}`).pipe(
      map((response) => this.normalizeProductItem(response)),
      catchError((error: HttpErrorResponse) =>
        throwError(() =>
          this.toApiError(error, 'No se pudo cargar el producto seleccionado.')
        )
      )
    );
  }

  verifyProductId(id: string): Observable<boolean> {
    return this.http
      .get<VerificationResponse>(`${this.baseUrl}/verification/${id}`)
      .pipe(
        map((response) => this.normalizeVerification(response)),
        catchError((error: HttpErrorResponse) =>
          throwError(() =>
            this.toApiError(error, 'No se pudo verificar el identificador.')
          )
        )
      );
  }

  createProduct(payload: ProductRequest): Observable<Product> {
    return this.http.post<ProductItemResponse>(this.baseUrl, payload).pipe(
      map((response) => this.normalizeProductItem(response)),
      catchError((error: HttpErrorResponse) =>
        throwError(() =>
          this.toApiError(error, 'No se pudo crear el producto.')
        )
      )
    );
  }

  updateProduct(id: string, payload: ProductRequest): Observable<Product> {
    return this.http.put<ProductItemResponse>(`${this.baseUrl}/${id}`, payload).pipe(
      map((response) => this.normalizeProductItem(response)),
      catchError((error: HttpErrorResponse) =>
        throwError(() =>
          this.toApiError(error, 'No se pudo actualizar el producto.')
        )
      )
    );
  }

  private normalizeProductCollection(response: ProductCollectionResponse): Product[] {
    if (Array.isArray(response)) {
      return response;
    }

    return Array.isArray(response.data) ? response.data : [];
  }

  private normalizeProductItem(response: ProductItemResponse): Product {
    if (this.isProduct(response)) {
      return response;
    }

    if (this.isProduct(response.data)) {
      return response.data;
    }

    throw new Error('La respuesta del backend no contiene un producto valido.');
  }

  private normalizeVerification(response: VerificationResponse): boolean {
    if (typeof response === 'boolean') {
      return response;
    }

    return Boolean(response.data);
  }

  private isProduct(value: unknown): value is Product {
    return (
      value !== null &&
      typeof value === 'object' &&
      'id' in value &&
      'name' in value &&
      'description' in value &&
      'logo' in value &&
      'date_release' in value &&
      'date_revision' in value
    );
  }

  private toApiError(error: HttpErrorResponse, fallbackMessage: string): ApiError {
    const backendMessage =
      typeof error.error === 'object' && error.error !== null && 'message' in error.error
        ? String((error.error as { message: unknown }).message)
        : undefined;

    return {
      status: error.status,
      message: backendMessage || fallbackMessage,
      details: error.error
    };
  }
}

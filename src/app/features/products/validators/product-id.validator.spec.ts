import { FormControl } from '@angular/forms';
import { ValidationErrors } from '@angular/forms';
import { Observable, of, throwError } from 'rxjs';

import { ProductService } from '../services/product.service';
import { productIdAvailableValidator } from './product-id.validator';

describe('productIdAvailableValidator', () => {
  let productService: jasmine.SpyObj<ProductService>;

  beforeEach(() => {
    productService = jasmine.createSpyObj<ProductService>('ProductService', [
      'verifyProductId'
    ]);
  });

  it('should return productIdExists when backend says id exists', (done) => {
    productService.verifyProductId.and.returnValue(of(true));
    const control = new FormControl('abc');

    runValidator(control).subscribe((result) => {
      expect(result).toEqual({ productIdExists: true });
      done();
    });
  });

  it('should return null when id is available', (done) => {
    productService.verifyProductId.and.returnValue(of(false));
    const control = new FormControl('abc');

    runValidator(control).subscribe((result) => {
      expect(result).toBeNull();
      done();
    });
  });

  it('should not call backend when sync length validation would fail', (done) => {
    const control = new FormControl('ab');

    runValidator(control).subscribe((result) => {
      expect(result).toBeNull();
      expect(productService.verifyProductId).not.toHaveBeenCalled();
      done();
    });
  });

  it('should expose a visual validation error when verification fails', (done) => {
    productService.verifyProductId.and.returnValue(
      throwError(() => new Error('network error'))
    );
    const control = new FormControl('abc');

    runValidator(control).subscribe((result) => {
      expect(result).toEqual({ productIdVerificationUnavailable: true });
      done();
    });
  });

  it('should skip validation when value is empty', (done) => {
    const control = new FormControl('');

    runValidator(control).subscribe((result) => {
      expect(result).toBeNull();
      expect(productService.verifyProductId).not.toHaveBeenCalled();
      done();
    });
  });

  it('should skip validation when value exceeds max length', (done) => {
    const control = new FormControl('12345678901');

    runValidator(control).subscribe((result) => {
      expect(result).toBeNull();
      expect(productService.verifyProductId).not.toHaveBeenCalled();
      done();
    });
  });

  it('should skip validation when value equals currentId', (done) => {
    productService.verifyProductId.and.returnValue(of(true));
    const control = new FormControl('abc');
    const result$ = productIdAvailableValidator(productService, 'abc')(control) as Observable<ValidationErrors | null>;

    result$.subscribe((result) => {
      expect(result).toBeNull();
      expect(productService.verifyProductId).not.toHaveBeenCalled();
      done();
    });
  });

  function runValidator(
    control: FormControl<string | null>
  ): Observable<ValidationErrors | null> {
    return productIdAvailableValidator(productService)(control) as Observable<ValidationErrors | null>;
  }
});

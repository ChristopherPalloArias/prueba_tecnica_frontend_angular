import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors
} from '@angular/forms';
import { Observable, catchError, map, of, timer, switchMap } from 'rxjs';

import { ProductService } from '../services/product.service';

export function productIdAvailableValidator(
  productService: ProductService,
  currentId?: string
): AsyncValidatorFn {
  return (
    control: AbstractControl<string | null>
  ): Observable<ValidationErrors | null> => {
    const value = control.value?.trim();

    if (!value || value.length < 3 || value.length > 10 || value === currentId) {
      return of(null);
    }

    return timer(250).pipe(
      switchMap(() => productService.verifyProductId(value)),
      map((exists) => (exists ? { productIdExists: true } : null)),
      catchError(() => of({ productIdVerificationUnavailable: true }))
    );
  };
}

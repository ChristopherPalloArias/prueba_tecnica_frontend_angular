import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

import { ProductFormMode } from '../../models/product-form.model';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent {
  @Input() form!: FormGroup;
  @Input() mode: ProductFormMode = 'create';
  @Input() isSaving = false;
  @Input() submitError = '';
  @Output() readonly save = new EventEmitter<void>();
  @Output() readonly cancel = new EventEmitter<void>();

  get title(): string {
    return this.mode === 'create' ? 'Formulario de Registro' : 'Editar Producto';
  }

  get submitLabel(): string {
    return this.mode === 'create' ? 'Enviar' : 'Guardar';
  }

  control(name: string): AbstractControl | null {
    return this.form.get(name);
  }

  shouldShowError(name: string): boolean {
    const control = this.control(name);

    return Boolean(control && control.invalid && (control.dirty || control.touched));
  }

  shouldShowRevisionMismatch(): boolean {
    const release = this.control('date_release');
    const revision = this.control('date_revision');

    return Boolean(
      this.form.hasError('revisionDateMismatch') &&
        ((release && (release.dirty || release.touched)) ||
          (revision && (revision.dirty || revision.touched)))
    );
  }

  errorMessage(name: string): string {
    const control = this.control(name);

    if (!control || !control.errors) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Este campo es requerido.';
    }

    if (control.hasError('minlength')) {
      const error = control.getError('minlength') as { requiredLength: number };
      return `Debe tener al menos ${error.requiredLength} caracteres.`;
    }

    if (control.hasError('maxlength')) {
      const error = control.getError('maxlength') as { requiredLength: number };
      return `Debe tener maximo ${error.requiredLength} caracteres.`;
    }

    if (control.hasError('releaseDatePast')) {
      return 'La fecha debe ser igual o mayor a la fecha actual.';
    }

    if (control.hasError('productIdExists')) {
      return 'El ID ingresado ya existe.';
    }

    if (control.hasError('productIdVerificationUnavailable')) {
      return 'No se pudo verificar el ID. Intenta nuevamente.';
    }

    return 'El campo no es valido.';
  }

  onSubmit(): void {
    this.save.emit();
  }
}

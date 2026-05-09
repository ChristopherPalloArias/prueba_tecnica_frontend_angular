import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';

export function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function todayInputValue(): string {
  return formatDateInput(new Date());
}

export function addOneYear(dateValue: string): string {
  const date = parseDateInput(dateValue);

  if (!date) {
    return '';
  }

  return formatDateInput(
    new Date(date.getFullYear() + 1, date.getMonth(), date.getDate())
  );
}

export function releaseDateValidator(): ValidatorFn {
  return (control: AbstractControl<string | null>): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    return control.value >= todayInputValue() ? null : { releaseDatePast: true };
  };
}

export function revisionDateMatchesReleaseValidator(
  releaseControlName = 'date_release',
  revisionControlName = 'date_revision'
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const release = control.get(releaseControlName)?.value as string | null;
    const revision = control.get(revisionControlName)?.value as string | null;

    if (!release || !revision) {
      return null;
    }

    return revision === addOneYear(release)
      ? null
      : { revisionDateMismatch: true };
  };
}

function parseDateInput(value: string): Date | null {
  const parts = value.split('-').map((part) => Number(part));

  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    return null;
  }

  return new Date(parts[0], parts[1] - 1, parts[2]);
}

import { FormControl, FormGroup } from '@angular/forms';

import {
  addOneYear,
  formatDateInput,
  releaseDateValidator,
  revisionDateMatchesReleaseValidator
} from './product-date.validator';

describe('product date validators', () => {
  it('should add one year to a date input value', () => {
    expect(addOneYear('2026-05-09')).toBe('2027-05-09');
  });

  it('should accept today as release date', () => {
    const control = new FormControl(formatDateInput(new Date()));

    expect(releaseDateValidator()(control)).toBeNull();
  });

  it('should reject past release dates', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const control = new FormControl(formatDateInput(yesterday));

    expect(releaseDateValidator()(control)).toEqual({ releaseDatePast: true });
  });

  it('should validate revision date exactly one year after release date', () => {
    const form = new FormGroup({
      date_release: new FormControl('2026-05-09'),
      date_revision: new FormControl('2027-05-09')
    });

    expect(revisionDateMatchesReleaseValidator()(form)).toBeNull();
  });

  it('should reject revision date when it is not one year after release date', () => {
    const form = new FormGroup({
      date_release: new FormControl('2026-05-09'),
      date_revision: new FormControl('2027-05-10')
    });

    expect(revisionDateMatchesReleaseValidator()(form)).toEqual({
      revisionDateMismatch: true
    });
  });

  it('should return empty string when addOneYear receives empty input', () => {
    expect(addOneYear('')).toBe('');
  });

  it('should return empty string when addOneYear receives invalid input', () => {
    expect(addOneYear('not-a-date')).toBe('');
  });

  it('should return empty string when addOneYear receives incomplete date', () => {
    expect(addOneYear('2026')).toBe('');
  });

  it('should return null from release validator when control has no value', () => {
    const control = new FormControl('');
    expect(releaseDateValidator()(control)).toBeNull();
  });

  it('should return null from revision validator when release is empty', () => {
    const form = new FormGroup({
      date_release: new FormControl(''),
      date_revision: new FormControl('2027-05-09')
    });

    expect(revisionDateMatchesReleaseValidator()(form)).toBeNull();
  });

  it('should return null from revision validator when revision is empty', () => {
    const form = new FormGroup({
      date_release: new FormControl('2026-05-09'),
      date_revision: new FormControl('')
    });

    expect(revisionDateMatchesReleaseValidator()(form)).toBeNull();
  });
});

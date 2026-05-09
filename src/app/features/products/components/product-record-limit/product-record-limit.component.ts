import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export type ProductRecordLimit = 5 | 10 | 20;

@Component({
  selector: 'app-product-record-limit',
  templateUrl: './product-record-limit.component.html',
  styleUrls: ['./product-record-limit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductRecordLimitComponent {
  @Input() selected: ProductRecordLimit = 5;
  @Output() readonly selectedChange = new EventEmitter<ProductRecordLimit>();

  readonly options: ProductRecordLimit[] = [5, 10, 20];

  onLimitChange(value: string): void {
    this.selectedChange.emit(Number(value) as ProductRecordLimit);
  }
}

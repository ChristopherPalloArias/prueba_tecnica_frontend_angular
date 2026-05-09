import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-product-search',
  templateUrl: './product-search.component.html',
  styleUrls: ['./product-search.component.scss']
})
export class ProductSearchComponent {
  @Input() value = '';
  @Output() readonly valueChange = new EventEmitter<string>();

  onSearch(value: string): void {
    this.valueChange.emit(value);
  }
}

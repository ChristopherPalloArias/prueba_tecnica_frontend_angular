import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { ProductRecordLimitComponent } from './components/product-record-limit/product-record-limit.component';
import { ProductSearchComponent } from './components/product-search/product-search.component';
import { ProductTableComponent } from './components/product-table/product-table.component';
import { ProductFormPageComponent } from './pages/product-form-page/product-form-page.component';
import { ProductListPageComponent } from './pages/product-list-page/product-list-page.component';
import { ProductsRoutingModule } from './products-routing.module';

@NgModule({
  declarations: [
    ProductFormComponent,
    ProductFormPageComponent,
    ProductListPageComponent,
    ProductRecordLimitComponent,
    ProductSearchComponent,
    ProductTableComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    ProductsRoutingModule
  ]
})
export class ProductsModule {}

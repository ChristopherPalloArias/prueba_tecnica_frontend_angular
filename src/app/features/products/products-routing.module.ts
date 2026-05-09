import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProductFormPageComponent } from './pages/product-form-page/product-form-page.component';
import { ProductListPageComponent } from './pages/product-list-page/product-list-page.component';

const routes: Routes = [
  {
    path: '',
    component: ProductListPageComponent
  },
  {
    path: 'new',
    component: ProductFormPageComponent
  },
  {
    path: ':id/edit',
    component: ProductFormPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule {}

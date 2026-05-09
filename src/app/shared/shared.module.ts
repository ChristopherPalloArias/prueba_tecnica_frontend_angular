import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ErrorMessageComponent } from './components/error-message/error-message.component';
import { LoadingIndicatorComponent } from './components/loading-indicator/loading-indicator.component';

@NgModule({
  declarations: [ErrorMessageComponent, LoadingIndicatorComponent],
  imports: [CommonModule],
  exports: [ErrorMessageComponent, LoadingIndicatorComponent]
})
export class SharedModule {}

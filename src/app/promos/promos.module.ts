import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { LazyLoadImageModule } from 'ng-lazyload-image';

import { PromosPage } from './promos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LazyLoadImageModule,
    RouterModule.forChild([
      {
        path: '',
        component: PromosPage
      }
    ])
  ],
  declarations: [PromosPage]
})
export class PromosPageModule {}

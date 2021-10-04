import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { RouterModule } from '@angular/router';

import { StoresPage } from './stores.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    LazyLoadImageModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: StoresPage
      }
    ])
  ],
  declarations: [StoresPage]
})
export class StoresPageModule {}

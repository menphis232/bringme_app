import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { LazyLoadImageModule } from 'ng-lazyload-image';

import { ArticlePage } from './article.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LazyLoadImageModule,
    RouterModule.forChild([
      {
        path: '',
        component: ArticlePage
      }
    ])
  ],
  declarations: [ArticlePage]
})
export class ArticlePageModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LatestNewsRoutingModule } from './latest-news-routing.module';
import { LatestNewsListComponent } from './pages/latest-news-list/latest-news-list.component';
import { AddLatestNewsComponent } from './pages/add-latest-news/add-latest-news.component';
import { SharedModule } from '@shared/shared.module';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { TableListComponent } from '@shared/new-components/table-list/table-list.component';
import { InputComponent } from '@shared/components/input/input.component';
import { UploadAttachmentComponent } from '@shared/components/upload-attachment/upload-attachment.component';
import { LayoutModule } from '@core/layout/layout.module';

@NgModule({
  declarations: [LatestNewsListComponent, AddLatestNewsComponent],
  imports: [CommonModule, SharedModule, EditorModule, LatestNewsRoutingModule,TableListComponent,
    UploadAttachmentComponent, LayoutModule
    ,InputComponent],
  providers: [
    { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' },
  ],
})
export class LatestNewsModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FilesDocumentsRoutingModule } from './files-documents-routing.module';
import { DocumentsListComponent } from './pages/documents-list/documents-list.component';
import { SharedModule } from '@shared/shared.module';
import { NgxEditorModule } from 'ngx-editor';
import { NgxDocViewerModule } from 'ngx-doc-viewer';

@NgModule({
  declarations: [DocumentsListComponent],
  imports: [
    CommonModule,
    SharedModule,
    NgxEditorModule,
    NgxDocViewerModule,

    FilesDocumentsRoutingModule,
  ],
  providers: [],
})
export class FilesDocumentsModule {}

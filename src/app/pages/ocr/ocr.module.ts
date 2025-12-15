import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OcrRoutingModule } from './ocr-routing.module';
import { OcrUploadComponent } from './pages/ocr-upload/ocr-upload.component';
import { SharedModule } from '@shared/shared.module';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgxCaptureModule } from 'ngx-capture';
import { EditorModule } from '@tinymce/tinymce-angular';

@NgModule({
  declarations: [OcrUploadComponent],
  imports: [
    CommonModule,
    SharedModule,
    PdfViewerModule,
    NgxCaptureModule,
    EditorModule,
    OcrRoutingModule,
  ],
})
export class OcrModule {}

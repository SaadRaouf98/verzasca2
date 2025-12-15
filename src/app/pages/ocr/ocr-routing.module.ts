import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OcrUploadComponent } from './pages/ocr-upload/ocr-upload.component';

const routes: Routes = [
  {
    path: '',
    component: OcrUploadComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OcrRoutingModule {}

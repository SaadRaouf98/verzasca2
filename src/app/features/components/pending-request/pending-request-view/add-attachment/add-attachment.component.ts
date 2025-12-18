import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadAttachmentComponent } from '@shared/components/upload-attachment/upload-attachment.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable, forkJoin } from 'rxjs';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';

@Component({
  selector: 'app-add-attachment',
  standalone: true,
  imports: [CommonModule, UploadAttachmentComponent, TranslateModule],
  templateUrl: './add-attachment.component.html',
  styleUrls: ['./add-attachment.component.scss'],
})
export class AddAttachmentComponent {
  attachmentIds: string[] = [];
  uploadedFileNames: string[] = []; // Track uploaded file names
  dialogRef = inject(MatDialogRef<AddAttachmentComponent>);
  manageImportsExportsService = inject(ManageImportsExportsService);
  // log(event: any) {
  //   for (const [key, value] of event.entries()) {
  //     if (value instanceof File) {
  //     } else {
  //     }
  //   }
  // }
  @ViewChild('uploadAttachment') uploadAttachmentComponent: any;
  log(event: any) {
    for (const [key, value] of event.entries()) {
      if (value instanceof File && !this.uploadedFileNames.includes(value.name)) {
        this.uploadedFileNames.push(value.name); // Add to tracking array
        this.manageImportsExportsService.wopiFilesService.createFile(value).subscribe((res) => {
          if (res) {
            this.attachmentIds.push(res);
            if (this.uploadAttachmentComponent) {
              // Find the uploaded file object by name and pass its ID to completeUpload
              const uploadedFile = this.uploadAttachmentComponent.uploadedFiles.find(
                (f: any) => (f.file.name || f.file?.originalName) === value.name
              );
              if (uploadedFile) {
                this.uploadAttachmentComponent.completeUpload(uploadedFile.id);
              }
            }
          }
        });
      } else {
      }
    }
  }

  onUploadAndClose() {
    this.dialogRef.close(this.attachmentIds);
  }
  onCancel(): void {
    this.dialogRef.close();
  }
}

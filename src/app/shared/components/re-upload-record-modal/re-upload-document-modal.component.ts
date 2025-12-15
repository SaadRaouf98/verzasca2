import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { TranslateService } from '@ngx-translate/core';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { isPdfFile, isTouched } from '@shared/helpers/helpers';

@Component({
  selector: 'app-re-upload-document-modal',
  templateUrl: './re-upload-document-modal.component.html',
  styleUrls: ['./re-upload-document-modal.component.scss'],
})
export class ReUploadDocumentModalComponent {
  disableSubmitBtn: boolean = false;
  form!: FormGroup;

  @ViewChild('hiddenFileToUpload') hiddenFileToUpload!: ElementRef;
  @ViewChild('visibleFileToUpload')
  visibleFileToUpload!: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      header: string;
      textAreaLabel: string;
      buttonLabel: string;
    },
    private dialogRef: MatDialogRef<ReUploadDocumentModalComponent>,
    private toastr: CustomToastrService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = new FormGroup({
      comment: new FormControl('', [Validators.required]),
      document: new FormControl('', [Validators.required]),
    });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }

    this.disableSubmitBtn = true;
    let { comment, document } = this.form.value;
    this.dialogRef.close({
      status: 'Succeeded',
      statusCode: ModalStatusCode.Success,
      data: {
        comment,
        document,
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }

  onFileDropped(e: any): void {
    for (const [key, value] of e.entries()) {
      if (value instanceof File) {
        this.uploadFile(value);
      }
    }
  }

  onAddFile(): void {
    let hiddenhtmlElement: HTMLInputElement = this.hiddenFileToUpload.nativeElement;
    hiddenhtmlElement.value = '';
    hiddenhtmlElement.click();
  }

  onFileChange(e: any): void {
    const filesArray = e.target.files;
    if (filesArray.length > 0) {
      this.uploadFile(filesArray[0]);
    }
  }
  @ViewChild('uploadAttachment') uploadAttachmentComponent: any;
  uploadFile(file: any): void {
    // if (!isPdfFile(file.name)) {
    //   this.toastr.error(
    //     this.translateService.instant('shared.fileShouldBePdf')
    //   );
    //   return;
    // }

    this.form.patchValue({
      document: file,
    });
    if (this.uploadAttachmentComponent) {
      // Robust comparison for file name
      const uploadedFile = this.uploadAttachmentComponent.uploadedFiles.find((f: any) => {
        const fName = f.file.name || f.file?.originalName;
        return fName && file.name && fName.toLowerCase().trim() === file.name.toLowerCase().trim();
      });
      if (uploadedFile) {
        this.uploadAttachmentComponent.completeUpload(uploadedFile.id);
      }
    }
    this.visibleFileToUpload.nativeElement.value = file.name;
    this.visibleFileToUpload.nativeElement.disabled = true;
  }

  deleteFile(): void {
    this.visibleFileToUpload.nativeElement.disabled = false;
    this.form.patchValue({
      document: null,
    });
  }
}

import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { isTouched, isWordFile } from '@shared/helpers/helpers';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-acceptance-action-modal',
  templateUrl: './acceptance-action-modal.component.html',
  styleUrls: ['./acceptance-action-modal.component.scss'],
})
export class AcceptanceActionModalComponent implements OnInit {
  disableSubmitBtn: boolean = false;
  form!: FormGroup;

  @ViewChild('fileToUpload') hiddenFileToUpload!: ElementRef;
  @ViewChild('attachment')
  visibleFileToUpload!: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      header: string;
      textAreaLabel: string;
      buttonLabel: string;
    },
    private dialogRef: MatDialogRef<AcceptanceActionModalComponent>,
    private toastr: CustomToastrService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = new FormGroup({
      comment: new FormControl(''),
      attachment: new FormControl(''),
    });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      // Mark all fields as touched to show validation errors
      this.form.markAllAsTouched();
      this.disableSubmitBtn = false;
      return;
    }
    this.disableSubmitBtn = true;
    let { comment, attachment } = this.form.value;

    this.dialogRef.close({
      status: 'Succeeded',
      statusCode: ModalStatusCode.Success,
      data: {
        comment,
        attachment,
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

  onGetFileNameId(files: FileList): void {
    this.form.patchValue({
      attachment: files?.item(0),
    });
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
    // if (!isWordFile(file.name)) {
    //   this.toastr.error(
    //     this.translateService.instant('shared.fileShouldBeWord')
    //   );
    //   return;
    // }

    this.form.patchValue({
      attachment: file,
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
    this.visibleFileToUpload.nativeElement.value = '';
    this.form.patchValue({
      attachment: null,
    });
  }
}

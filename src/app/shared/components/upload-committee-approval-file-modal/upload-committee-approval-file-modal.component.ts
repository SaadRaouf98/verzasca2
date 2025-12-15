import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { requestGroups } from '@core/constants/request-groups.constant';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { TranslateService } from '@ngx-translate/core';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { isPdfFile, isTouched } from '@shared/helpers/helpers';

@Component({
  selector: 'app-upload-committee-approval-file-modal',
  templateUrl: './upload-committee-approval-file-modal.component.html',
  styleUrls: ['./upload-committee-approval-file-modal.component.scss'],
})
export class UploadCommitteeApprovalFileModalComponent implements OnInit {
  disableSubmitBtn: boolean = false;
  form!: FormGroup;

  @ViewChild('hiddenFileToUpload') hiddenFileToUpload!: ElementRef;
  @ViewChild('visibleFileToUpload')
  visibleFileToUpload!: ElementRef;
  requestGroups = requestGroups;
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      header: string;
      textAreaLabel: string;
      buttonLabel: string;
    },
    private dialogRef: MatDialogRef<UploadCommitteeApprovalFileModalComponent>,
    private toastr: CustomToastrService,
    public translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = new FormGroup({
      document: new FormControl('', [Validators.required]),
      group: new FormControl(null, [Validators.required]),
    });

    // Subscribe to form changes to debug validation
    // this.form.valueChanges.subscribe(() => {?.errors);?.errors);
    // });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }

    this.disableSubmitBtn = true;
    let { document } = this.form.value;
    this.dialogRef.close({
      status: 'Succeeded',
      statusCode: ModalStatusCode.Success,
      data: {
        document,
        CommitteeStepGroup: this.form.value.group,
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
    // Check if file is a Word document based on the app-upload-attachment configuration
    // const allowedTypes = [
    //   '.doc',
    //   '.docx',
    //   'application/msword',
    //   'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // ];
    // const isValidFile = allowedTypes.some(
    //   (type) =>
    //     file.name?.toLowerCase().endsWith(type.toLowerCase()) ||
    //     file.type === type
    // );

    // if (!isValidFile) {
    //   this.toastr.error(
    //     this.translateService.instant('shared.fileShouldBeWord')
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

    // Mark the field as touched to trigger validation
    this.form.get('document')?.markAsTouched();
    this.form.get('document')?.updateValueAndValidity();

    // Update the visible input if it exists
    if (this.visibleFileToUpload?.nativeElement) {
      this.visibleFileToUpload.nativeElement.value = file.name;
      this.visibleFileToUpload.nativeElement.disabled = true;
    }
  }

  deleteFile(): void {
    if (this.visibleFileToUpload?.nativeElement) {
      this.visibleFileToUpload.nativeElement.disabled = false;
      this.visibleFileToUpload.nativeElement.value = '';
    }

    this.form.patchValue({
      document: null,
    });

    // Mark the field as touched and update validation
    this.form.get('document')?.markAsTouched();
    this.form.get('document')?.updateValueAndValidity();
  }
}

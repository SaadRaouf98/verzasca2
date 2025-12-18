import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RequestAttachment } from '@core/models/request-attachment.model';
import { Attachment } from '@core/models/request.model';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { TranslateService } from '@ngx-translate/core';
import { EditFileWithBarcodeModalComponent } from '@pages/imports-exports/modals/edit-file-with-barcode-modal/edit-file-with-barcode-modal.component';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { isTouched } from '@shared/helpers/helpers';

import { timeout } from 'rxjs';

@Component({
  selector: 'app-add-import-attachments',
  templateUrl: './add-import-attachments.component.html',
  styleUrls: ['./add-import-attachments.component.scss'],
})
export class AddImportAttachmentsComponent {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  displayProgressSpinner: boolean = false;

  @Input() requestId!: string;

  @ViewChild('visibleFileToUpload') visibleFileToUpload!: ElementRef;
  @ViewChild('hiddenFileToUpload') hiddenFileToUpload!: ElementRef;

  constructor(
    private dialog: MatDialog,
    private manageImportsExportsService: ManageImportsExportsService,
    private toastr: CustomToastrService,
    private router: Router,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    //Incase user navigates here to just add attachments, so we need to view the previuos uploaded attachments
    this.getRequestAttachments();
  }

  initializeForm(): void {
    this.form = new FormGroup({
      attachmentInput: new FormControl('', []),
      attachments: new FormArray([], []),
    });
  }

  getRequestAttachments(): void {
    this.manageImportsExportsService.requestsService.getRequestById(this.requestId).subscribe({
      next: (res) => {
        //Handle adding attachments
        res.attachments.forEach((attachment, index) => {
          this.attachments.push(new FormControl('', []));

          this.attachments.controls[index]?.patchValue({
            fileBlob: '',
            fileType: attachment.contentType,
            fileName: attachment.name,
            fileId: attachment.id,
            filePath: attachment.path,
          });
        });
      },
    });
  }

  get attachmentInput(): FormControl {
    return this.form?.get('attachmentInput') as FormControl;
  }

  get attachments(): FormArray {
    return this.form?.get('attachments') as FormArray;
  }

  onInsertFileToList(attachment?: {
    fileBlob: File;
    fileType: string;
    fileName: string;
    fileId: string;
    filePath: string;
  }): void {
    const attachmentToInsert = attachment ?? this.attachmentInput.value;

    if (attachmentToInsert) {
      this.displayProgressSpinner = true;

      this.manageImportsExportsService.wopiFilesService
        .createFile(attachmentToInsert.fileBlob)
        .pipe(timeout(9900000))
        .subscribe({
          next: (res) => {
            this.displayProgressSpinner = false;

            this.attachments.push(new FormControl('', []));

            const attachmentsLength = this.attachments.length;

            this.attachments.controls[
              attachmentsLength > 0 ? attachmentsLength - 1 : 0
            ]?.patchValue({ ...attachmentToInsert, fileId: res });

            this.attachmentInput.setValue(null);

            const hiddenFileToUploadHtmlElement: HTMLInputElement =
              this.hiddenFileToUpload.nativeElement;
            hiddenFileToUploadHtmlElement.disabled = false;

            const visibleFileToUploadHtmlElement: HTMLInputElement =
              this.visibleFileToUpload.nativeElement;

            visibleFileToUploadHtmlElement.value = '';
            visibleFileToUploadHtmlElement.disabled = false;
          },
          error: (err) => {
            this.attachmentInput.setValue(null);
            const hiddenFileToUploadHtmlElement: HTMLInputElement =
              this.hiddenFileToUpload.nativeElement;
            hiddenFileToUploadHtmlElement.disabled = false;

            const visibleFileToUploadHtmlElement: HTMLInputElement =
              this.visibleFileToUpload.nativeElement;

            visibleFileToUploadHtmlElement.value = '';
            visibleFileToUploadHtmlElement.disabled = false;
          },
        });
    }
  }

  onFileDropped(e: DragEvent): void {
    e.preventDefault();
    const files = e.dataTransfer!.files;

    for (const file of Array.from(files)) {
      this.uploadFile(file);
      this.onInsertFileToList({
        fileBlob: file,
        fileType: '.' + file.name.split('.').pop(), //.pdf
        fileName: file.name,
        fileId: '',
        filePath: '',
      });
    }
  }

  onAddFile(): void {
    const hiddenFileToUploadHtmlElement: HTMLInputElement = this.hiddenFileToUpload.nativeElement;
    hiddenFileToUploadHtmlElement.value = '';
    hiddenFileToUploadHtmlElement.click();
  }

  onFileChange(e: any): void {
    const filesArray = e.target.files;

    if (filesArray.length > 0) {
      this.uploadFile(filesArray[0]);
    }
  }

  uploadFile(file: File): void {
    this.attachmentInput.patchValue({
      fileBlob: file,
      fileType: '.' + file.name.split('.').pop(), //.pdf
      fileName: file.name,
      fileId: '',
      filePath: '',
    });
    const hiddenFileToUploadHtmlElement: HTMLInputElement = this.hiddenFileToUpload.nativeElement;
    hiddenFileToUploadHtmlElement.disabled = true;

    const visibleFileToUploadHtmlElement: HTMLInputElement = this.visibleFileToUpload.nativeElement;

    visibleFileToUploadHtmlElement.value = file.name;
    visibleFileToUploadHtmlElement.disabled = true;
  }

  onDeleteFile(index: number): void {
    this.attachments.removeAt(index);
  }

  onViewAttachment(index: number): void {
    const attachment: {
      fileBlob: File;
      fileType: string;
      fileName: string;
      fileId: string;
      filePath: string;
    } = this.attachments.controls[index]?.value;

    if (attachment.fileType === '.pdf') {
      //We need to fetch pdf file from server
      this.manageImportsExportsService.wopiFilesService
        .getTemporaryFile(attachment.fileId)
        .subscribe({
          next: (res) => {
            this.dialog
              .open(EditFileWithBarcodeModalComponent, {
                minWidth: '95vw',
                autoFocus: false,
                disableClose: false,
                data: {
                  fileBlob: res,
                  fileType: attachment.fileType, //.pdf
                  fileName: attachment.fileName,
                  fileId: attachment.fileId,
                  filePath: attachment.filePath,
                  requestId: this.requestId,
                },
              })
              .afterClosed()
              .subscribe((res) => {});
          },
        });
    } else {
      //The file is not pdf,Just open the dialog
      this.dialog
        .open(EditFileWithBarcodeModalComponent, {
          minWidth: '95vw',
          maxHeight: '95vh',
          autoFocus: false,
          disableClose: false,
          panelClass: ['action-modal', 'float-footer'],
          data: {
            fileBlob: attachment.fileBlob,
            fileType: attachment.fileType, //.doc
            fileName: attachment.fileName,
            fileId: attachment.fileId,
            filePath: attachment.filePath,
            requestId: this.requestId,
          },
        })
        .afterClosed()
        .subscribe((res) => {});
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.disableSubmitBtn = true;

    let attachmentsIds: string[] = [];

    this.form.value.attachments.forEach(
      (attachment: {
        fileBlob: File;
        fileType: string;
        fileName: string;
        fileId: string;
        filePath: string;
      }) => {
        attachmentsIds.push(attachment.fileId);
      }
    );

    this.manageImportsExportsService.requestsService
      .updateAttachments(this.requestId, attachmentsIds)
      .subscribe({
        next: (res) => {
          this.disableSubmitBtn = false;

          this.toastr.success(this.translateService.instant(`shared.dataCreatedSuccessfully`));
          this.router.navigate(['imports-exports']);
        },
        error: (err) => this.handleErrorResponse(err),
      });
  }

  handleErrorResponse(err?: any): void {
    this.disableSubmitBtn = false;
    this.toastr.error(this.translateService.instant('shared.SomethingWentWrong'));
  }

  // Used to get a strongly typed FormControl
  getFormControlByIndex(formArray: FormArray, index: number): FormControl {
    return formArray.controls[index] as FormControl;
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }

  onGettingPreviousStep(): void {}
}

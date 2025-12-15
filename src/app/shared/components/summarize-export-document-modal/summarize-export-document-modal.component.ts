import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActionType } from '@core/enums/action-type.enum';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { TranslateService } from '@ngx-translate/core';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { isWordFile } from '@shared/helpers/helpers';
import { ManageSharedService } from '@shared/services/manage-shared.service';

@Component({
  selector: 'app-summarize-export-document-modal',
  templateUrl: './summarize-export-document-modal.component.html',
  styleUrls: ['./summarize-export-document-modal.component.scss'],
})
export class SummarizeExportDocumentModalComponent implements OnInit {
  disableSubmitBtn: boolean = false;
  form!: FormGroup;

  @ViewChild('documentToUpload')
  hiddenInputDocumentToUpload!: ElementRef;
  @ViewChild('documentAttachment')
  visibleDocumentAttachment!: ElementRef;

  @ViewChild('secondTabHiddenWordFileToUpload')
  secondTabHiddenWordFileToUpload!: ElementRef;
  @ViewChild('secondTabVisibleWordFileToUpload')
  secondTabVisibleWordFileToUpload!: ElementRef;

  selectedTabIndex: number = 0; //could be either 0 or 1 //0 for 'editor tab' and 1 for 'uploaded file tab'

  //New Editor
  @ViewChild('editorForm') editorForm!: ElementRef;
  hasEditorLoaded: boolean = false;
  editorFileId: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      header: string;
      buttonLabel: string;
      requestId: string;
      actionId: string;
      editorFileId: string;
    },
    private dialogRef: MatDialogRef<SummarizeExportDocumentModalComponent>,
    private manageSharedService: ManageSharedService,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    this.editorFileId = this.data.editorFileId;
  }

  initializeForm(): void {
    this.form = new FormGroup(
      {
        editorTab: new FormGroup({
          //uploadedFile: new FormControl('', []),
        }),
        uploadFileTab: new FormGroup({
          uploadedFile: new FormControl('', []),
        }),
      },
      {
        //validators: this.validateForm(),
      }
    );
  }

  private validateForm(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      if (this.selectedTabIndex === 1) {
        if (!form.get('uploadFileTab')?.get('uploadedFile')?.value) {
          return {
            uploadTabNotValid: true,
          };
        }
      }

      this.cdr.detectChanges();

      return null;
    };
  }

  onSelectedTabChange(event: MatTabChangeEvent): void {
    this.selectedTabIndex = event.index;
  }

  setEditorHasLoaded() {
    this.hasEditorLoaded = true;
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }

    this.disableSubmitBtn = true;
    const { editorTab, uploadFileTab } = this.form.value;

    if (this.selectedTabIndex === 0) {
      if (!this.hasEditorLoaded) {
        this.toastr.warning(this.translateService.instant('shared.editorNotLoaded'));
        this.disableSubmitBtn = false;
        return;
      }
      //Editor tab

      try {
        //@ts-ignore
        const iframe = document.getElementById('office').contentWindow;
        iframe.postMessage(
          JSON.stringify({
            MessageId: 'Action_Save',
            Values: {
              DontTerminateEdit: false,
              DontSaveIfUnmodified: false,
            },
          }),

          '*'
        );
      } catch (err) {}

      const dataToSend = {
        documentId: this.editorFileId,
      };
      this.executeRequestAction(dataToSend);
    } else {
      //User is in second tab
      if (!uploadFileTab.uploadedFile) {
        this.toastr.warning(this.translateService.instant('shared.editorNotLoaded'));
        return;
      }
      const dataToSend = {
        document: uploadFileTab.uploadedFile,
      };

      this.executeRequestAction(dataToSend);
    }
  }

  private executeRequestAction(data: { documentId?: string; document?: File }) {
    this.dialogRef.close({
      status: 'Succeeded',
      statusCode: ModalStatusCode.Success,
      data,
    });
  }

  onCancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }

  /* onAddDocumentFile(): void {
    let htmlElement: HTMLInputElement =
      this.hiddenInputDocumentToUpload.nativeElement;
    htmlElement.value = '';
    htmlElement.click();
  }

  onDocumentFileChange(e: any): void {
    const filesArray = e.target.files;
    if (filesArray.length > 0) {
      this.uploadDocumentFile(filesArray[0]);
    }
  }

  async uploadDocumentFile(file: File): Promise<any> {
    this.form.patchValue({
      uploadedFile: file,
    });

    let hiddenInputStudyDocumentHtmlElement: HTMLInputElement =
      this.hiddenInputDocumentToUpload.nativeElement;
    hiddenInputStudyDocumentHtmlElement.disabled = true;

    const visibleInputStudyDocumentHtmlElement: HTMLInputElement =
      this.visibleDocumentAttachment.nativeElement;

    visibleInputStudyDocumentHtmlElement.value = file.name;
    visibleInputStudyDocumentHtmlElement.disabled = true;

    const base64String = await getBase64(file);

    TXTextControl.loadDocument(
      streamTypeMapper['.docx'],
      btoa(base64String as string),
      (data: any) => {}
    );
  } 

  onDeleteDocumentFile(): void {
    const hiddenInputDocumentToUploadHtmlElement: HTMLInputElement =
      this.hiddenInputDocumentToUpload.nativeElement;
    hiddenInputDocumentToUploadHtmlElement.disabled = false;

    const visibleInputDocumentToUploadHtmlElement: HTMLInputElement =
      this.visibleDocumentAttachment.nativeElement;
    visibleInputDocumentToUploadHtmlElement.disabled = false;

    this.form.patchValue({
      uploadedFile: null,
    });
  }*/

  ////////////////////////////// Second tab ////////////////////////////////////////////

  onFileDropped(e: any): void {
    for (const [key, value] of e.entries()) {
      if (value instanceof File) {
        this.uploadFile(value);
      }
    }
  }
  onAddSecondTabWordFile(): void {
    let htmlElement: HTMLInputElement = this.secondTabHiddenWordFileToUpload.nativeElement;
    htmlElement.value = '';
    htmlElement.click();
  }

  // onSecondTabWordFileChange(e: any): void {
  //   const filesArray = e.target.files;
  //   if (filesArray.length > 0) {
  //     this.uploadSecondTabWordFile(filesArray[0]);
  //   }
  // }

  @ViewChild('uploadAttachment') uploadAttachmentComponent: any;

  uploadFile(file: File): void {
    // if (!isWordFile(file.name)) {
    //   this.toastr.error(
    //     this.translateService.instant('shared.fileShouldBeWord')
    //   );
    //   return;
    // }

    this.uploadFileTab.patchValue({
      uploadedFile: file,
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
    let secondTabHiddenWordFileToUploadHtmlElement: HTMLInputElement =
      this.secondTabHiddenWordFileToUpload.nativeElement;
    secondTabHiddenWordFileToUploadHtmlElement.disabled = true;

    const secondTabVisibleWordFileToUploadHtmlElement: HTMLInputElement =
      this.secondTabVisibleWordFileToUpload.nativeElement;

    secondTabVisibleWordFileToUploadHtmlElement.value = file.name;
    secondTabVisibleWordFileToUploadHtmlElement.disabled = true;
  }

  onDeleteSecondTabWordFile(): void {
    const secondTabHiddenWordFileToUploadHtmlElement: HTMLInputElement =
      this.secondTabHiddenWordFileToUpload.nativeElement;
    secondTabHiddenWordFileToUploadHtmlElement.disabled = false;

    const secondTabVisibleWordFileToUploadHtmlElement: HTMLInputElement =
      this.secondTabVisibleWordFileToUpload.nativeElement;
    secondTabVisibleWordFileToUploadHtmlElement.disabled = false;

    this.uploadFileTab.patchValue({
      uploadedFile: null,
    });
  }

  get editorTab(): FormGroup {
    return this.form?.get('editorTab') as FormGroup;
  }

  get uploadFileTab(): FormGroup {
    return this.form?.get('uploadFileTab') as FormGroup;
  }
}

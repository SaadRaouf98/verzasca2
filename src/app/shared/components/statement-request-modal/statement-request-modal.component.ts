import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ManageSharedService } from '@shared/services/manage-shared.service';

import { LanguageService } from '@core/services/language.service';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { Observable } from 'rxjs';
import { AllEntities } from '@core/models/entity.model';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import {
  compareFn,
  downloadBlobOrFile,
  isPdfFile,
  isTouched,
  isWordFile,
} from '@shared/helpers/helpers';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { environment } from '@env/environment';
import { ExportStatement } from '@core/models/export-statement.model';

@Component({
  selector: 'app-statement-request-modal',
  templateUrl: './statement-request-modal.component.html',
  styleUrls: ['./statement-request-modal.component.scss'],
})
export class StatementRequestModalComponent implements OnInit {
  disableSubmitBtn: boolean = false;
  form!: FormGroup;
  foundationsList$: Observable<AllEntities> = new Observable();
  isFileUploaded = false;
  selectedContentTabIndex: number = 0; //1 for editor tab , 0 for upload file tab
  lang: string = 'ar';
  editorUrl = environment.editoUrl;

  //For normal upload without editor
  @ViewChild('hiddenInputToUpload')
  hiddenInputToUpload!: ElementRef;
  @ViewChild('visibleInputToUpload')
  visibleInputToUpload!: ElementRef;

  readonly dropDownProperties = ['id', 'title'];
  //New Editor
  hasEditorLoaded: boolean = false;
  editorFileId: string = '';

  currentExportStatement: ExportStatement | null = null;
  hasUserVisitedContentTab: boolean = false;

  compareFn = compareFn;

  @ViewChild('editorForm') editorForm!: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      header: string;
      buttonLabel: string;
      requestId: string;
      requestAutoNumber: string;
      actionId: string;
      editorFileId: string;
    },
    private dialogRef: MatDialogRef<StatementRequestModalComponent>,
    private manageSharedService: ManageSharedService,
    private languageService: LanguageService,
    private toastr: CustomToastrService,
    public translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.patchForm();
    this.initializeDropDownLists();
    this.lang = this.languageService.language;

    this.editorFileId = this.data.editorFileId;
  }

  initializeForm(): void {
    this.form = new FormGroup({
      foundations: new FormControl([], [Validators.required]),
      uploadedFile: new FormControl('', [Validators.required]),
      comment: new FormControl('', []),
    });
  }

  private validateForm(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      if (
        this.selectedContentTabIndex === 0 &&
        !form.get('originalFile')?.value &&
        !form.get('contentTab')?.get('uploadTab')?.get('uploadedFile')?.value
      ) {
        return {
          uploadTabNotValid: true,
        };
      }

      return null;
    };
  }

  patchForm(): void {
    this.manageSharedService.requestsService
      .getCurrentExportStatement(this.data.requestId)
      .subscribe({
        next: (res) => {
          this.currentExportStatement = res;

          if (res.foundations.length) {
            this.form.patchValue({
              foundations: res.foundations,
            });
          }

          if (res.file) {
            this.manageSharedService.requestsService
              .getRequestSingleAttachment(res.file.id)
              .subscribe({
                next: (fileRes) => {
                  const file: File = new File([fileRes], res.file!.name);
                  this.form.patchValue({ uploadedFile: file });
                },
              });
          }

          if (res.comment) {
            this.form.patchValue({ comment: res.comment });
          }
        },
      });
  }

  onDownloadOriginalUploadedFile(): void {
    const fileToDownload: File = this.form.get('originalFile')?.value;

    downloadBlobOrFile(fileToDownload.name, undefined, fileToDownload);
  }

  initializeDropDownLists(): void {
    this.foundationsList$ = this.manageSharedService.foundationsService.getFoundationsList(
      {
        pageSize: 20,
        pageIndex: 0,
      },
      {
        parentId: null,
      },
      undefined,
      this.dropDownProperties
    );
  }

  searchOnFoundations(event: { term: string; items: any[] }) {
    this.foundationsList$ = this.manageSharedService.foundationsService.getFoundationsList(
      {
        pageSize: 10,
        pageIndex: 0,
      },
      {
        parentId: null,
        searchKeyword: event.term,
      },
      undefined,
      this.dropDownProperties
    );
  }

  // Form Controls Getters
  get foundations() {
    return this.form.get('foundations') as FormControl;
  }

  get uploadedFile() {
    return this.form.get('uploadedFile') as FormControl;
  }

  get comment() {
    return this.form.get('comment') as FormControl;
  }

  setEditorHasLoaded() {
    this.hasEditorLoaded = true;
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }

    try {
      this.disableSubmitBtn = true;

      const { foundations, uploadedFile, comment } = this.form.value;

      if (!uploadedFile) {
        this.toastr.warning(this.translateService.instant('shared.uploadFileRequired'));
        this.disableSubmitBtn = false;
        return;
      }

      const dataToSend = {
        foundationsIds: foundations.map((ele: any) => ele.id || ele.value || ele),
        file: uploadedFile,
        comment,
      };
      this.executeRequestAction(dataToSend);
    } catch (e) {
      this.disableSubmitBtn = false;
      this.toastr.warning(this.translateService.instant('shared.completeFillingFields'));
    }
  }

  private executeRequestAction(data: any) {
    this.dialogRef.close({
      status: 'Succeeded',
      statusCode: ModalStatusCode.Success,
      data,
    });
  }

  onSelectMainTab(event: MatTabChangeEvent): void {
    if (event.index === 1) {
      this.hasUserVisitedContentTab = true;
    }
  }

  onSelectedContentTabChange(event: MatTabChangeEvent): void {
    this.selectedContentTabIndex = event.index;

    if (event.index === 1) {
      //We are in Editor tab
      this.onDeleteFileToNotPatchInEditor();
    } else if (event.index === 0) {
      //We are in upload file tab
    }
  }

  ////////////////////////////////////////////////////////////

  // onFileDropped(e: DragEvent): void {
  //   const file = e.dataTransfer!.files[0];
  //   this.uploadFileToNotPatchInEditor(file);
  //   e.preventDefault();
  // }
  onFileDropped(e: any): void {
    for (const [key, value] of e.entries()) {
      if (value instanceof File) {
        this.uploadFileToNotPatchInEditor(value);
      }
    }
  }
  // onAddFileToNotPatchInEditor(): void {
  //   const htmlElement: HTMLInputElement =
  //     this.hiddenInputToUpload.nativeElement;
  //   htmlElement.value = '';
  //   htmlElement.click();
  // }

  onFileChangeToNotPatchInEditor(e: any): void {
    const filesArray = e.target.files;
    if (filesArray.length > 0) {
      this.uploadFileToNotPatchInEditor(filesArray[0]);
    }
  }
  @ViewChild('uploadAttachment') uploadAttachmentComponent: any;
  uploadFileToNotPatchInEditor(file: File): void {
    // if (!isWordFile(file.name)) {
    //   this.toastr.error(
    //     this.translateService.instant('shared.fileShouldBeWordOrPdf')
    //   );
    //   return;
    // }

    this.uploadedFile.patchValue(file);
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
    this.isFileUploaded = true;
  }

  onDeleteFileToNotPatchInEditor(): void {
    const hiddenInputToUploadHtmlElement: HTMLInputElement = this.hiddenInputToUpload.nativeElement;
    hiddenInputToUploadHtmlElement.disabled = false;

    const visibleInputToUploadHtmlElement: HTMLInputElement =
      this.visibleInputToUpload.nativeElement;
    visibleInputToUploadHtmlElement.disabled = false;

    this.uploadedFile.patchValue(null);
  }

  onCancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }

  isTouched(groupName: string, controlName: string): boolean | undefined {
    return isTouched(this.form.get(groupName) as FormGroup, controlName);
  }

  onSetIfFoundationIsTouched(touched: boolean): void {
    if (touched) {
      this.foundations.markAsTouched();
    } else {
      this.foundations.markAsUntouched();
    }
  }
}

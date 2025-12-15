import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { ActionType } from '@core/enums/action-type.enum';
import { RequestProgressType } from '@core/enums/request-progress-type.enum';
import { Attachment } from '@core/models/request.model';
import { AllUsers } from '@core/models/user.model';
import { AuthService } from '@core/services/auth/auth.service';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { EditorEditMode } from '@shared/enums/editor-edit-mode.enum';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import {
  downloadBlobOrFile,
  getBase64,
  isTouched,
  isWordFile,
  streamTypeMapper,
} from '@shared/helpers/helpers';
import { ManageSharedService } from '@shared/services/manage-shared.service';

import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-auditing-modal',
  templateUrl: './auditing-modal.component.html',
  styleUrls: ['./auditing-modal.component.scss'],
})
export class AuditingModalComponent implements OnInit {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  usersList$: Observable<AllUsers> = new Observable();

  editorToken: string = environment.editorToken;
  editMode = EditorEditMode.Edit;
  userNames: string[] = [];
  isEditorLoading: boolean = true;

  fileExtension: string = '.docx'; //must be either '.docx' or '.doc'
  doccumentFile!: File;

  selectedTabIndex: number = 0; //could be either 0 or 1 //0 for 'editor tab' and 1 for 'uploaded file tab'
  RequestProgressType = RequestProgressType;

  @ViewChild('secondTabHiddenWordFileToUpload')
  secondTabHiddenWordFileToUpload!: ElementRef;
  @ViewChild('secondTabVisibleWordFileToUpload')
  secondTabVisibleWordFileToUpload!: ElementRef;

  @ViewChild('hiddenInputFileToUpload') hiddenInputFileToUpload!: ElementRef;
  @ViewChild('visibleInputFileToUpload') visibleInputFileToUpload!: ElementRef;
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;

  //New Editor
  hasEditorLoaded: boolean = false;
  editorFileId: string = '';
  isFileUploaded = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      header: string;
      requestId: string;
      requestAutoNumber: string;
      actionId: string;
      studyingFile: Attachment;
      actionType: ActionType;
      editorFileId: string;
      currentProgress: RequestProgressType;
    },
    private dialogRef: MatDialogRef<AuditingModalComponent>,
    private manageSharedService: ManageSharedService,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.userNames = [this.authService.user.unique_name];
    this.loadOriginalFile().subscribe();
    this.editorFileId = this.data.editorFileId;

    // Listen to form value changes to update tab validation indicators
    this.form.valueChanges.subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  initializeForm(): void {
    this.form = new FormGroup(
      {
        originalFile: new FormControl('', []),
        editorTab: new FormGroup({
          comment: new FormControl('', []),
        }),

        uploadFileTab: new FormGroup({
          comment: new FormControl('', []),
          uploadedFile: new FormControl('', []),
        }),
      },
      {
        validators: this.validateForm(),
      }
    );
  }

  private validateForm(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      if (
        this.selectedTabIndex === 0 &&
        !form.get('originalFile')?.value &&
        !form.get('uploadFileTab')?.get('uploadedFile')?.value
      ) {
        return {
          uploadTabNotValid: true,
        };
      }

      return null;
    };
  }

  loadOriginalFile(): Observable<File> {
    return this.manageSharedService.requestsService
      .getRequestSingleAttachment(this.data.editorFileId)
      .pipe(
        map((res) => {
          const file: File = new File([res], this.data.studyingFile.name);
          this.form.patchValue({
            originalFile: file,
          });
          //this.uploadFileTab.get('originalFile')!.updateValueAndValidity(); //to trigger form custom validation function
          this.cdr.detectChanges();

          return file;
        })
      );
  }

  onDownloadOriginalUploadedFile(): void {
    const originalFile: File = this.form.get('originalFile')?.value;
    if (originalFile) {
      downloadBlobOrFile(originalFile.name, undefined, originalFile);
    } else {
      this.loadOriginalFile().subscribe((res) => {
        downloadBlobOrFile(res.name, undefined, res);
      });
    }
  }

  setEditorHasLoaded() {
    this.hasEditorLoaded = true;
    this.cdr.detectChanges(); // Trigger change detection for tab validation
  }

  onSubmit() {
    this.disableSubmitBtn = true;
    const { originalFile, editorTab, uploadFileTab } = this.form.value;

    if (this.selectedTabIndex === 1) {
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
        comment: editorTab.comment,
        documentId: this.editorFileId,
      };
      this.executeRequestAction(dataToSend);
    } else {
      //User is in second tab

      const dataToSend = {
        comment: uploadFileTab.comment,
        document: this.isFileUploaded ? uploadFileTab.uploadedFile || originalFile : '',
      };
      this.executeRequestAction(dataToSend);
    }
  }

  private executeRequestAction(data: any) {
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

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }

  onSelectedTabChange(event: MatTabChangeEvent): void {
    this.selectedTabIndex = event.index;
    this.form.updateValueAndValidity();
    this.cdr.detectChanges(); // Trigger change detection for tab validation
  }

  // Tab Navigation Methods
  goToNextTab(): void {
    if (this.selectedTabIndex < 1) {
      this.selectedTabIndex++;
      this.form.updateValueAndValidity();
      this.cdr.detectChanges(); // Trigger change detection for tab validation
    }
  }

  goToPreviousTab(): void {
    if (this.selectedTabIndex > 0) {
      this.selectedTabIndex--;
      this.form.updateValueAndValidity();
      this.cdr.detectChanges(); // Trigger change detection for tab validation
    }
  }

  // Check if tabs have data
  isUploadTabValid(): boolean {
    const uploadFileTab = this.form.get('uploadFileTab');
    const hasComment = uploadFileTab?.get('comment')?.value?.trim();
    const hasUploadedFile = uploadFileTab?.get('uploadedFile')?.value;
    // Don't consider the original file since it's loaded automatically

    return !!(hasComment || hasUploadedFile);
  }

  isEditorTabValid(): boolean {
    const editorTab = this.form.get('editorTab');
    const hasComment = editorTab?.get('comment')?.value?.trim();

    return !!(hasComment || this.hasEditorLoaded);
  }

  ////////////////////////////// Second tab ////////////////////////////////////////////
  onFileDropped(e: any): void {
    for (const [key, value] of e.entries()) {
      if (value instanceof File) {
        this.uploadSecondTabWordFile(value);
      }
    }
    // const file = e.dataTransfer!.files[0];

    // this.uploadSecondTabWordFile(file);

    // e.preventDefault();
  }

  onAddSecondTabWordFile(): void {
    let htmlElement: HTMLInputElement = this.secondTabHiddenWordFileToUpload.nativeElement;
    htmlElement.value = '';
    htmlElement.click();
  }

  onSecondTabWordFileChange(e: any): void {
    const filesArray = e.target.files;
    if (filesArray.length > 0) {
      this.uploadSecondTabWordFile(filesArray[0]);
    }
  }
  @ViewChild('uploadAttachment') uploadAttachmentComponent: any;
  uploadSecondTabWordFile(file: File): void {
    if (!isWordFile(file.name)) {
      this.toastr.error(this.translateService.instant('shared.fileShouldBeWord'));
      return;
    }

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
    this.isFileUploaded = true;


    this.cdr.detectChanges(); // Trigger change detection for tab validation
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

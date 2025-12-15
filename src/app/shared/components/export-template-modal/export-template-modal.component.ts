import { ChangeDetectorRef, Component, HostListener, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LanguageService } from '@core/services/language.service';
import {
  convertToIFormFile,
  downloadBlobOrFile,
  getBase64,
  isPdfFile,
  isSmallDeviceWidthForPopup,
  isTouched,
  streamTypeMapper,
} from '@shared/helpers/helpers';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { AuthService } from '@core/services/auth/auth.service';
import { ManageSharedService } from '@shared/services/manage-shared.service';
import { environment } from '@env/environment';
import { EditorEditMode } from '@shared/enums/editor-edit-mode.enum';
import { EditorStreamType } from '@shared/enums/editor-stream-type.enum';
import { Attachment, RequestCurrentExport } from '@core/models/request.model';
import { InsertionMode } from '@core/enums/editor-frame-insertion-mode.enum';
import { ClipboardMode } from '@shared/enums/editor-clipboard.enum';
import { ExportedDocumentType } from '@core/enums/exported-docuemnt-type.enum';

import {
  EmbeddedViewRef,
  Injector,
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  ViewChild,
} from '@angular/core';
// import { CdkDrag } from '@angular/cdk/drag-drop';
import { PDFSource, PdfViewerComponent } from 'ng2-pdf-viewer';
// import { MahtherlistComponent } from '../mahtherlist/mahtherlist.component'
import { SignaturePlaceHolderComponent } from '../signature-place-holder/signature-place-holder.component';
import { MahtherPageSelector } from '../MahtherPageSelector';
import { InitiatePlaceHolderComponent } from '../initiate-place-holder/initiate-place-holder.component';
import { ApplicationFieldFormat } from '@core/enums/editor-application-field-format.enum';
import { Observable, map } from 'rxjs';
import { NormalPagePlaceholderComponent } from '../normal-page-placeholder/normal-page-placeholder.component';
import { RequestProgressType } from '@core/enums/request-progress-type.enum';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { CustomToastrService } from '@core/services/custom-toastr.service';

declare const TXTextControl: any;

@Component({
  host: { '(document:click)': 'hideContextMenu($event)' },
  selector: 'app-export-template-modal',
  templateUrl: './export-template-modal.component.html',
  styleUrls: ['./export-template-modal.component.scss'],
})
export class ExportTemplateModalComponent {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  filedUploaded: boolean = false;

  editorToken: string = environment.editorToken;
  editMode = EditorEditMode.Edit;
  userNames: string[] = [];
  isEditorLoading: boolean = true;
  hasDocumentbeenLoaded: boolean = false;

  lang: string = 'ar';
  error: any;

  readonly dropDownProperties = ['id', 'title', 'titleEn'];

  @ViewChild('hiddenPdfFileToUpload')
  hiddenPdfFileToUpload!: ElementRef;
  @ViewChild('visiblePdfFileToUpload')
  visiblePdfFileToUpload!: ElementRef;

  @ViewChild('hiddenNotePdfFile')
  hiddenNotePdfFile!: ElementRef;
  @ViewChild('visibleNotePdfFile')
  visibleNotePdfFile!: ElementRef;

  @HostListener('document:txDocumentEditorLoaded', ['$event'])
  onTxDocumentEditorLoaded(): void {
    TXTextControl.addEventListener('textControlLoaded', (data: any) => {
      this.isEditorLoading = false;
      TXTextControl.clipboardMode = ClipboardMode.Client;
      TXTextControl.pageSize.setWidth(1200);

      this.patchEditor();
    });
  }

  //////////////////////// Second Tab ///////////////////////////////////////

  @ViewChild(PdfViewerComponent, { static: true })
  pdfViewer!: PdfViewerComponent;
  @ViewChild('contextmenuEl', { static: true }) contextmenuElement!: ElementRef;
  @ViewChild('pdfHolder', { static: true }) pdfholder!: ElementRef;
  showThumbnails = false;
  contextmenuOpened!: boolean;

  mahtherPages: number[] = [];
  signatures: ComponentRef<SignaturePlaceHolderComponent>[] = [];
  initiate!: ComponentRef<InitiatePlaceHolderComponent> | null;
  lastContextMenu!: { parent: any; x: number; y: number } | undefined;
  pdfSrc: string | Uint8Array | PDFSource | undefined;

  hasInitiated: boolean = false;
  hasPutSignatures: boolean = false;

  normalPagesLabelsComponentsRefs: {
    index: number;
    comRef: ComponentRef<NormalPagePlaceholderComponent>;
  }[] = [];

  normalPagesIndexes: number[] = [];
  RequestProgressType = RequestProgressType;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      header: string;
      buttonLabel: string;
      requestId: string;
      actionId: string;
      requestAutoNumber: string;
      studyingFile: Attachment;
      currentProgress: RequestProgressType;
      currentExport: RequestCurrentExport;
    },
    private dialogRef: MatDialogRef<ExportTemplateModalComponent>,
    private manageSharedService: ManageSharedService,
    private languageService: LanguageService,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private injector: Injector,
    private appRef: ApplicationRef,
    private resolver: ComponentFactoryResolver,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.lang = this.languageService.language;
    this.userNames = [this.authService.user.unique_name];
    this.initializeForm();
    this.getExportNumber();
    this.detectSignaturePlaceHolderDeletion();
    this.detectInitiatePlaceHolderDeletion();
    this.detectNormalPlaceHolderDeletion();
  }

  initializeForm(): void {
    this.form = new FormGroup({
      exportNumber: new FormControl('', [Validators.required]),
      editorTab: new FormGroup({}),
      uploadFileTab: new FormGroup({
        originalUploadedFile: new FormControl('', [Validators.required]),
        userJustUploadedFile: new FormControl('', [Validators.required]),
        uploadedNote: new FormControl('', []),
      }),
    });
  }

  getExportNumber(): void {
    this.manageSharedService.requestsService.getExportNumber(this.data.requestId).subscribe({
      next: (res) => {
        this.form.patchValue({
          exportNumber: res,
        });
      },
    });
  }

  detectSignaturePlaceHolderDeletion(): void {
    this.manageSharedService.SignaturePlaceHoldersDeletion.subscribe({
      next: (userId) => {
        if (userId && this.signatures.length) {
          //Delete the signature box
          let indexToBeDeleted = -1;
          this.signatures.forEach((ele, index) => {
            if (userId === ele.instance.user.id) {
              indexToBeDeleted = index;
            }
          });

          if (indexToBeDeleted !== -1) {
            this.appRef.detachView(this.signatures[indexToBeDeleted].hostView);
            this.signatures.splice(indexToBeDeleted, 1);
          }
        } else if (
          !userId &&
          this.signatures.length &&
          this.data.currentExport.type === ExportedDocumentType.Note
        ) {
          this.appRef.detachView(this.signatures[0].hostView);
          this.signatures.splice(0, 1);
        }
      },
    });
  }

  detectInitiatePlaceHolderDeletion(): void {
    this.manageSharedService.InitiatePlaceHoldersDeletion.subscribe({
      next: (toDelete) => {
        if (toDelete && this.initiate) {
          this.appRef.detachView(this.initiate!.hostView);
          this.initiate = null;
        }
      },
    });
  }

  detectNormalPlaceHolderDeletion(): void {
    this.manageSharedService.NormalPaperPlaceHoldersDeletion.subscribe({
      next: (pageIndexNumberToDelete) => {
        if (pageIndexNumberToDelete !== -1 && this.normalPagesLabelsComponentsRefs.length) {
          if (this.normalPagesIndexes.includes(pageIndexNumberToDelete)) {
            const componentRefToBeDeleted = this.normalPagesLabelsComponentsRefs.find(
              (ele) => ele.index === pageIndexNumberToDelete
            )!;

            const index1 = this.normalPagesIndexes.indexOf(pageIndexNumberToDelete);
            this.normalPagesIndexes.splice(index1, 1);

            componentRefToBeDeleted.comRef.destroy();

            const index2 = this.normalPagesLabelsComponentsRefs.indexOf(componentRefToBeDeleted);

            this.normalPagesLabelsComponentsRefs.splice(index2, 1);

            this.appRef.detachView(componentRefToBeDeleted.comRef!.hostView);
          }
        }
      },
    });
  }

  onDownloadOriginalUploadedFile(): void {
    const fileToDownload: File = this.uploadFileTab.get('originalUploadedFile')?.value;

    if (fileToDownload) {
      downloadBlobOrFile(fileToDownload.name, undefined, fileToDownload);
    } else {
      this.loadOriginalFile().subscribe({
        next: (res) => {
          downloadBlobOrFile(res.name, undefined, res);
        },
      });
    }
  }

  /* onDownloadBarcode(): void {
    this.manageSharedService.requestsService
      .getBarcode(this.data.requestId)
      .subscribe((res) => {
        const a = document.createElement('a'); //Create <a>
        a.href = 'data:image/png;base64,' + res; //Image Base64 Goes here
        a.download = 'barcoe.png'; //File name Here
        a.click();
      });
  } */

  loadOriginalFile(): Observable<File> {
    return this.manageSharedService.exportableDocumentService
      .getExportablePdfDocument(this.data.currentExport.id, true)
      .pipe(
        map((res) => {
          const file = new File([res], this.data.studyingFile.name);
          this.uploadFileTab.patchValue({
            originalUploadedFile: file,
          });
          return file;
        })
      );
  }

  patchEditor(): void {
    this.loadOriginalFile().subscribe({
      next: async (file) => {
        const index = this.data.studyingFile.name.lastIndexOf('.');
        const extension = index >= 0 ? this.data.studyingFile.name.substring(index) : '.docx';
        const base64String = await getBase64(file);

        TXTextControl.loadDocument(
          streamTypeMapper[extension],
          btoa(base64String as string),
          () => {
            this.hasDocumentbeenLoaded = true;
            this.cdr.detectChanges();
          }
        );
      },
    });
  }

  /*   onAddBarcode(): void {
    this.manageSharedService.requestsService
      .getBarcode(this.data.requestId)
      .subscribe((res) => {
        TXTextControl.images.addAnchoredAtLocation(
          res,
          {
            x: 3,
            y: 3,
          }, //not sure
          -1,
          InsertionMode.DisplaceCompleteLines,
          (data: any) => {
          }
        );
      });
  }
 */
  onAddInitiate(): void {
    this.addNewStaticSignature({
      propertyName: 'Document_Initiate',
      yPosition: 0,
    });
  }

  addNewStaticSignature({
    propertyName = '',
    userTitle = '',
    user = { id: '', name: '' },
    width = 1200,
    height = 1200,
    xPosition = 0,
    yPosition = 0,
  }): void {
    TXTextControl.signatureFields.addAnchoredAtLocation(
      {
        width: width,
        height: height,
      },
      {
        x: xPosition,
        y: yPosition,
      },
      100000,
      InsertionMode.BelowTheText,
      (data: any) => {
        data.setName(propertyName);
        data.setSignerData(
          {
            address: '',
            contactInfo: '',
            name: user.name,
            reason: '',
            title: userTitle,
          },
          (success: any) => {},
          (err: any) => {}
        );
      },
      (err: any) => {}
    );
  }

  onAddSignatures(): void {
    /* TXTextControl.setSelectObjects(true, (data: any) => {
    }); */

    if (this.data.currentExport.type === ExportedDocumentType.Record) {
      this.manageSharedService.recordsService
        .getExportSignatures(this.data.currentExport.id)
        .subscribe((res) => {
          let textPosition = 0;
          TXTextControl.pageSize.getWidth((data: number) => {});
          const rowWidthInTwips = 10000;
          let xPosition = 0;
          let yPosition = 0;

          res.sections.forEach((section, index) => {
            textPosition += 2000;
            if (index > 0) {
              yPosition += 2500;
            }
            xPosition = 0;

            section.items.forEach((item) => {
              if (item.user) {
                this.addNewStaticSignature({
                  propertyName: item.user?.key,
                  userTitle: item.title,
                  user: item.user,
                  width: (parseFloat(item.size.toPrecision(2)) * rowWidthInTwips) / 100,
                  height: 2000,
                  xPosition: xPosition,
                  yPosition: yPosition,
                });
                this.addTextFrame({
                  width: (parseFloat(item.size.toPrecision(2)) * rowWidthInTwips) / 100,
                  height: 1000,
                  xPosition: xPosition,
                  yPosition: yPosition + 2000,
                  text: item.user.name,
                });
              }

              xPosition = xPosition +=
                (parseFloat(item.size.toPrecision(2)) * rowWidthInTwips) / 100;
            });
          });
        });
    } else {
      this.addNewStaticSignature({
        propertyName: 'Document_Signature',
        width: 3000,
        height: 2000,
      });
    }
  }

  private addTextFrame({
    width = 1200,
    height = 1200,
    xPosition = 0,
    yPosition = 0,
    text = '',
  }): void {
    TXTextControl.textFrames.addAnchoredAtLocation(
      {
        width: width,
        height: height,
      },
      {
        x: xPosition,
        y: yPosition,
      },
      100000,
      InsertionMode.BelowTheText,
      (textFrame: any) => {
        textFrame.applicationFields.add(
          ApplicationFieldFormat.MSWord,
          '',
          text,
          [],
          (data: any) => {},
          (err: any) => {}
        );
      }
    );
  }

  onSubmit(): void {
    this.disableSubmitBtn = true;
    const { exportNumber } = this.form.value;

    TXTextControl.getText(
      (data: any) => {
        if (!data.length) {
          this.toastr.error(
            this.translateService.instant('SharedModule.StudyProjectModalComponent.editorIsEmpty')
          );

          return;
        }

        TXTextControl.saveDocument(
          streamTypeMapper['.pdf'],
          (e: { bytesWritten: number; data: string; streamType: EditorStreamType }) => {
            const document = convertToIFormFile(
              e.data,
              `${this.getFileNameWithoutExtension(this.data.studyingFile.name)}.pdf`,
              '.pdf'
            );

            const dataToSend = {
              exportNumber,
              document,
            };
            this.executeRequestAction(dataToSend);
          },
          undefined, //saveSettings callback function (optional)
          (err: any) => {
            this.toastr.error(this.translateService.instant('shared.SomethingWentWrong'));
          }
        );
      },
      (err: any) => {
        this.toastr.error(this.translateService.instant('shared.SomethingWentWrong'));
      }
    );
  }

  private executeRequestAction(data: any) {
    this.dialogRef.close({
      status: 'Succeeded',
      statusCode: ModalStatusCode.Success,
      data,
    });
  }

  private getFileNameWithoutExtension(filename: string) {
    var lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      return filename.substring(0, lastDotIndex);
    }
    return filename;
  }

  isTouched(groupName: string, controlName: string): boolean | undefined {
    return isTouched(this.form.get(groupName) as FormGroup, controlName);
  }

  onCancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }

  get editorTab(): FormGroup {
    return this.form?.get('editorTab') as FormGroup;
  }

  get uploadFileTab(): FormGroup {
    return this.form?.get('uploadFileTab') as FormGroup;
  }

  ngOnDestroy(): void {
    if (
      !this.isEditorLoading &&
      TXTextControl &&
      typeof TXTextControl.removeFromDom === 'function'
    ) {
      //The editor has been initialized
      TXTextControl.removeFromDom();
    }
  }

  ////////////////////////////// Second tab ////////////////////////////////////////////
  ////////////////////////////////// انشاء مستند الدراسة (من خلال ال editor)  //////////////////////////////////////

  onFileDropped(e: DragEvent): void {
    const file = e.dataTransfer!.files[0];

    this.uploadPdfFile(file);

    e.preventDefault();
  }

  onAddPdfFile(): void {
    let htmlElement: HTMLInputElement = this.hiddenPdfFileToUpload.nativeElement;
    htmlElement.value = '';
    htmlElement.click();
  }

  onPdfFileChange(e: any): void {
    // const filesArray = e.target.files;
    // if (filesArray.length > 0) {
    //   this.uploadPdfFile(filesArray[0]);
    // }
    for (const [key, value] of e.entries()) {
      if (value instanceof File) {
        this.uploadPdfFile(value);
      }
    }
    this.filedUploaded = true;
  }
  @ViewChild('uploadAttachment') uploadAttachmentComponent: any;
  uploadPdfFile(file: File): void {
    if (!isPdfFile(file.name)) {
      this.toastr.error(this.translateService.instant('shared.fileShouldBePdf'));
      return;
    }

    this.uploadFileTab.patchValue({
      userJustUploadedFile: file,
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
    // Handle legacy file input elements safely (only if they exist)
    if (this.hiddenPdfFileToUpload?.nativeElement) {
      let hiddenPdfFileToUploadHtmlElement: HTMLInputElement =
        this.hiddenPdfFileToUpload.nativeElement;
      hiddenPdfFileToUploadHtmlElement.disabled = true;
    }

    if (this.visiblePdfFileToUpload?.nativeElement) {
      const visiblePdfFileToUploadHtmlElement: HTMLInputElement =
        this.visiblePdfFileToUpload.nativeElement;
      visiblePdfFileToUploadHtmlElement.value = file.name;
      visiblePdfFileToUploadHtmlElement.disabled = true;
    }

    let reader = new FileReader();

    reader.onload = () => {
      let url = URL.createObjectURL(new Blob([file], { type: 'application/pdf' }));
      this.mahtherPages.length = 0;
      this.pdfSrc = url;

      // Set filedUploaded to true to show the PDF viewer
      this.filedUploaded = true;
    };
    this.signatures.length = 0;
    reader.readAsArrayBuffer(file);
  }

  onDeletePdfFile(): void {
    this.filedUploaded = false;

    // Handle legacy file input elements safely (only if they exist)
    if (this.hiddenPdfFileToUpload?.nativeElement) {
      const hiddenPdfFileToUploadHtmlElement: HTMLInputElement =
        this.hiddenPdfFileToUpload.nativeElement;
      hiddenPdfFileToUploadHtmlElement.disabled = false;
    }

    if (this.visiblePdfFileToUpload?.nativeElement) {
      const visiblePdfFileToUploadHtmlElement: HTMLInputElement =
        this.visiblePdfFileToUpload.nativeElement;
      visiblePdfFileToUploadHtmlElement.disabled = false;
    }

    this.uploadFileTab.patchValue({
      userJustUploadedFile: null,
    });
    this.error = null;

    this.normalPagesIndexes = [];
    this.normalPagesLabelsComponentsRefs = [];
    this.pdfSrc = undefined;
  }

  /////////////////////////////////////////////////

  onNoteFileDropped(e: DragEvent): void {
    const file = e.dataTransfer!.files[0];

    this.uploadNotePdfFile(file);

    e.preventDefault();
  }

  onAddNotePdfFile(): void {
    let htmlElement: HTMLInputElement = this.hiddenNotePdfFile.nativeElement;
    htmlElement.value = '';
    htmlElement.click();
  }

  onNotePdfFileChange(e: any): void {
    const filesArray = e.target.files;
    if (filesArray.length > 0) {
      this.uploadNotePdfFile(filesArray[0]);
    }
  }

  uploadNotePdfFile(file: File): void {
    if (!isPdfFile(file.name)) {
      this.toastr.error(this.translateService.instant('shared.fileShouldBePdf'));
      return;
    }

    this.uploadFileTab.patchValue({
      uploadedNote: file,
    });

    let hiddenNotePdfFile: HTMLInputElement = this.hiddenNotePdfFile.nativeElement;
    hiddenNotePdfFile.disabled = true;

    const visibleNotePdfFile: HTMLInputElement = this.visibleNotePdfFile.nativeElement;

    visibleNotePdfFile.value = file.name;
    visibleNotePdfFile.disabled = true;
  }

  onDeleteNotePdfFile(): void {
    const hiddenNotePdfFile: HTMLInputElement = this.hiddenNotePdfFile.nativeElement;
    hiddenNotePdfFile.disabled = false;

    const visibleNotePdfFile: HTMLInputElement = this.visibleNotePdfFile.nativeElement;
    visibleNotePdfFile.disabled = false;

    this.uploadFileTab.patchValue({
      uploadedNote: null,
    });
    this.error = null;
  }

  ///////////////////////////////////////////////////////////////
  hideContextMenu(e: any) {
    this.contextmenuOpened = false;
  }

  toggleThumbnails() {
    this.showThumbnails = !this.showThumbnails;
    window.dispatchEvent(new Event('resize'));
    this.updateViewer();
  }

  updateViewer() {
    this.pdfViewer.updateSize();
  }

  pageRendered(event: any) {
    let page = event.pageNumber;

    const componentRef = this.resolver
      .resolveComponentFactory(MahtherPageSelector)
      .create(this.injector);
    this.appRef.attachView(componentRef.hostView);
    const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;

    event.source.div.appendChild(domElem);

    componentRef.instance.select.subscribe((e) => this.selectPage(e));
    componentRef.instance.page = page;
    componentRef.instance.emitClick();
  }

  selectPage(e: { page: number; selected: boolean }) {
    if (e.selected) this.mahtherPages.push(e.page);
    else {
      let idx = this.mahtherPages.indexOf(e.page);
      this.mahtherPages.splice(idx, 1);
    }
  }

  createSignaturePlaceholderComponent() {
    this.hasPutSignatures = true;

    for (let sig of this.signatures) {
      sig.destroy();
    }

    this.signatures.length = 0;

    if (this.data.currentExport.type === ExportedDocumentType.Record) {
      this.manageSharedService.recordsService
        .getExportSignatures(this.data.currentExport.id)
        .subscribe((res) => {
          let topOffsetPercentage = 0.01;
          if (res.sections.length <= 2) {
            topOffsetPercentage = 0.65;
          } else if (res.sections.length <= 5) {
            topOffsetPercentage = 0.35;
          }

          res.sections.forEach((section, outerIndex) => {
            let totalSumOfRowElementsWidthPercentage = 0;

            section.items.forEach((item) => {
              if (item.user) {
                const componentRef = this.resolver
                  .resolveComponentFactory(SignaturePlaceHolderComponent)
                  .create(this.injector);

                componentRef.instance.top =
                  (topOffsetPercentage + outerIndex * 0.12) *
                  this.lastContextMenu!.parent.clientHeight;

                componentRef.instance.left =
                  totalSumOfRowElementsWidthPercentage *
                    (this.lastContextMenu!.parent.clientWidth * 0.95) +
                  0.025 * this.lastContextMenu!.parent.clientWidth;

                componentRef.instance.width =
                  (item.size / 100) * (this.lastContextMenu!.parent.clientWidth * 0.95); //to leave right and left margins both are 2.5%

                componentRef.instance.height = 120;

                componentRef.instance.pageNumber = parseInt(
                  this.lastContextMenu!.parent.getAttribute('data-page-number')
                );
                componentRef.instance.user = {
                  id: item.user.id,
                  name: item.user.name,
                  key: item.user.key,
                };

                componentRef.instance.parentHeight = this.lastContextMenu!.parent.clientHeight;
                componentRef.instance.parentWidth = this.lastContextMenu!.parent.clientWidth;

                this.appRef.attachView(componentRef.hostView);
                const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
                  .rootNodes[0] as HTMLElement;

                this.signatures.push(componentRef);
                this.lastContextMenu!.parent.appendChild(domElem);
              } else {
                //empty space box
              }

              totalSumOfRowElementsWidthPercentage += item.size / 100;
            });
          });
          this.lastContextMenu = undefined;

          //////////////////
        });
    } else {
      const componentRef = this.resolver
        .resolveComponentFactory(SignaturePlaceHolderComponent)
        .create(this.injector);

      componentRef.instance.top = 0.65 * this.lastContextMenu!.parent.clientHeight;

      componentRef.instance.left = 0.025 * this.lastContextMenu!.parent.clientWidth;

      componentRef.instance.width =
        (33.33 / 100) * (this.lastContextMenu!.parent.clientWidth * 0.95); //to leave right and left margins both are 2.5%

      componentRef.instance.height = 120;

      componentRef.instance.pageNumber = parseInt(
        this.lastContextMenu!.parent.getAttribute('data-page-number')
      );
      componentRef.instance.user = {
        id: '',
        name: 'توقيع الأمين',
        key: 'Document_Signature',
      };

      componentRef.instance.parentHeight = this.lastContextMenu!.parent.clientHeight;
      componentRef.instance.parentWidth = this.lastContextMenu!.parent.clientWidth;

      this.appRef.attachView(componentRef.hostView);
      const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;

      this.signatures.push(componentRef);
      this.lastContextMenu!.parent.appendChild(domElem);
      this.lastContextMenu = undefined;
    }
  }

  createInitiatePlaceholderComponent() {
    if (this.initiate) {
      this.initiate.destroy();
      this.initiate = null;
    }
    //1)- Call api to get intiator user
    this.manageSharedService.requestsService.getInitiator(this.data.requestId).subscribe((res) => {
      //2)- Add to DOM
      const componentRef = this.resolver
        .resolveComponentFactory(InitiatePlaceHolderComponent)
        .create(this.injector);

      componentRef.instance.top = 0.55 * this.lastContextMenu!.parent.clientHeight;

      componentRef.instance.left = 0.25 * this.lastContextMenu!.parent.clientWidth;

      componentRef.instance.width = 100;

      componentRef.instance.height = 100;

      componentRef.instance.pageNumber = parseInt(
        this.lastContextMenu!.parent.getAttribute('data-page-number')
      );

      componentRef.instance.parentHeight = this.lastContextMenu!.parent.clientHeight;
      componentRef.instance.parentWidth = this.lastContextMenu!.parent.clientWidth;

      if (res) {
        componentRef.instance.user = res;
      } else {
        componentRef.instance.user = {
          id: '',
          name: 'التركين',
        };
      }

      this.appRef.attachView(componentRef.hostView);
      const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;

      this.initiate = componentRef;
      this.lastContextMenu!.parent.appendChild(domElem);
    });
  }

  onCreateNormalPagePlaceholderComponent(): void {
    const currentDataPageIndex = this.lastContextMenu!.parent.getAttribute('data-page-number') - 1;

    if (this.normalPagesIndexes.includes(currentDataPageIndex)) {
      return;
    }

    const componentRef = this.resolver
      .resolveComponentFactory(NormalPagePlaceholderComponent)
      .create(this.injector);

    //- Add to DOM

    componentRef.instance.top = 0;

    componentRef.instance.left = 0;

    componentRef.instance.width = 170;

    componentRef.instance.height = 100;

    componentRef.instance.pageNumber = parseInt(
      this.lastContextMenu!.parent.getAttribute('data-page-number')
    );

    componentRef.instance.parentHeight = this.lastContextMenu!.parent.clientHeight;
    componentRef.instance.parentWidth = this.lastContextMenu!.parent.clientWidth;

    componentRef.instance.pageIndex = currentDataPageIndex;

    this.appRef.attachView(componentRef.hostView);
    const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;

    this.normalPagesLabelsComponentsRefs.push({
      index: currentDataPageIndex,
      comRef: componentRef,
    });
    this.normalPagesIndexes.push(currentDataPageIndex);

    this.lastContextMenu!.parent.appendChild(domElem);
  }

  contextmenu(e: any) {
    //e is <pdf-viewer>

    this.contextmenuOpened = true;
    e.preventDefault();

    this.contextmenuElement.nativeElement.style.position = 'fixed';
    this.contextmenuElement.nativeElement.style.left = e.clientX + 'px';
    this.contextmenuElement.nativeElement.style.top = e.clientY + 'px';

    let parent: any = e.srcElement;
    let safeCounter = 0;

    while (!parent.classList.contains('page') && safeCounter < 100) {
      parent = parent.parentNode;
      safeCounter++;
    }

    this.lastContextMenu = {
      parent: parent, //<div class="page" data-page-number=""
      x: e.layerX, //e is <pdf-viewer>
      y: e.layerY, //e is <pdf-viewer>
    };
  }

  onSubmitSecondTab(): void {
    if (!this.hasPutSignatures) {
      const dialogRef = this.dialog.open(ConfirmModalComponent, {
        autoFocus: false,
        minWidth: '31.25rem',
        maxWidth: '31.25rem',
        maxHeight: '44.3125rem',
        panelClass: 'action-modal',
        disableClose: true,
        data: {
          msg: 'عفوا لاتوجد توقيعات. هل انت متأكد من الاستكمال وتأكيد العملية ؟',
        },
      });

      dialogRef
        .afterClosed()
        .subscribe((dialogResult: { statusCode: ModalStatusCode; status: string }) => {
          if (dialogResult.statusCode === ModalStatusCode.Success) {
            this.sendData();
          }
        });
    } else {
      this.sendData();
    }
  }

  sendData(): void {
    this.disableSubmitBtn = true;
    const { exportNumber } = this.form.value;

    const places = [];
    for (let sign of this.signatures) {
      places.push({
        fieldName: sign.instance.user.key, //key or 'Document_Initiate'
        // userId: sign.instance.user.id,
        page: sign.instance.pageNumber,
        top: 100 * (sign.instance.top / sign.instance.parentHeight),
        left: 100 * (sign.instance.left / sign.instance.parentWidth),
        width: 100 * (sign.instance.width / sign.instance.parentWidth),
        height: 100 * (sign.instance.height / sign.instance.parentHeight),
      });
    }

    if (this.initiate) {
      places.push({
        fieldName: 'Document_Initiate',
        page: this.initiate.instance.pageNumber,
        top: 100 * (this.initiate.instance.top / this.initiate.instance.parentHeight),
        left: 100 * (this.initiate.instance.left / this.initiate.instance.parentWidth),
        width: 100 * (this.initiate.instance.width / this.initiate.instance.parentWidth),
        height: 100 * (this.initiate.instance.height / this.initiate.instance.parentHeight),
      });
    }

    const fileToSend: File = this.uploadFileTab.get('userJustUploadedFile')?.value;

    const uploadedNoteFile: File = this.uploadFileTab.get('uploadedNote')?.value;

    //-) Call api

    const dataToSend = {
      exportNumber,
      noteFile: uploadedNoteFile,
      signatures: places,
      document: fileToSend,
      normalPagesIndexes: this.normalPagesIndexes,
    };
    this.executeRequestAction(dataToSend);
  }

  isControlTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }

  onError(error: any): void {
    this.error = error; // set error

    if (error.name === 'PasswordException') {
      const password = prompt('This document is password protected.Please Enter the password:');

      if (password) {
        this.error = null;
        this.setPassword(password);
      }
    }
  }

  setPassword(password: string): void {
    let newSrc: PDFSource;

    if (this.pdfSrc instanceof ArrayBuffer) {
      newSrc = { data: this.pdfSrc as any };
      // newSrc = { data: this.pdfSrc };
    } else if (typeof this.pdfSrc === 'string') {
      newSrc = { url: this.pdfSrc };
    } else {
      newSrc = { ...this.pdfSrc };
    }

    newSrc.password = password;

    this.pdfSrc = newSrc;
  }
}

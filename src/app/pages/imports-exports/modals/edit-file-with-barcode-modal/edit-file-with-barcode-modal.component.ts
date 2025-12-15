import {
  AfterViewInit,
  ApplicationRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  EmbeddedViewRef,
  Inject,
  Injector,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { TranslateService } from '@ngx-translate/core';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { BarcodePlaceHolderComponent } from '@shared/components/barcode-place-holder/barcode-place-holder.component';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { ManageSharedService } from '@shared/services/manage-shared.service';
import { PDFSource, PdfViewerComponent } from 'ng2-pdf-viewer';

import { Observable } from 'rxjs';

@Component({
  host: { '(document:click)': 'hideContextMenu($event)' },
  selector: 'app-edit-file-with-barcode-modal',
  templateUrl: './edit-file-with-barcode-modal.component.html',
  styleUrls: [
    './edit-file-with-barcode-modal.component.scss',
    '../../pages/request-details/request-details.component.scss',
  ],
})
export class EditFileWithBarcodeModalComponent implements OnInit, AfterViewInit {
  hasDocumentBeenUpdatedByUser: boolean = false;
  barcodeBase64Str: string = '';

  pdfFile: {
    fileBlob: Blob | undefined;
    pdfSrc: string | Uint8Array | PDFSource | undefined;
    name: string;
  } = {
    fileBlob: undefined,
    pdfSrc: undefined,
    name: this.data.fileName,
  };

  barcode!: ComponentRef<BarcodePlaceHolderComponent> | null;
  lastContextMenu!: { parent: any; x: number; y: number } | undefined;
  contextmenuOpened!: boolean;
  showThumbnails = false;

  //New Editor
  hasEditorLoaded: boolean = false;

  error: any;

  @ViewChild(PdfViewerComponent, { static: true })
  pdfViewer!: PdfViewerComponent;
  @ViewChild('contextmenuEl', { static: true }) contextmenuElement!: ElementRef;
  @ViewChild('pdfHolder', { static: true }) pdfholder!: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      fileBlob: Blob;
      fileType: string;
      fileUrl: string;
      fileName: string;
      fileId: string;
      filePath: string;
      requestId: string;
      showBarcode?: boolean;
    },
    private manageSharedService: ManageSharedService,
    private manageImportsExportsService: ManageImportsExportsService,
    private dialogRef: MatDialogRef<EditFileWithBarcodeModalComponent>,
    private appRef: ApplicationRef,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    private toastr: CustomToastrService,
    private translateService: TranslateService
  ) {}

  ngAfterViewInit(): void {
    this.hasEditorLoaded = true;
  }

  ngOnInit(): void {
    // Default showBarcode to true unless explicitly set to false
    if (this.data.showBarcode === undefined) {
      this.data.showBarcode = true;
    }

    if (this.data.fileType === '.pdf') {
      this.viewPdfFile();
      this.detectBarcodePlaceHolderDeletion();
    }
  }

  viewPdfFile(): void {
    this.pdfFile.fileBlob = this.data.fileBlob;
    this.pdfFile.pdfSrc = URL.createObjectURL(this.pdfFile.fileBlob);
  }

  detectBarcodePlaceHolderDeletion(): void {
    this.manageSharedService.BarcodePlaceHoldersDeletion.subscribe((toDelete) => {
      if (toDelete && this.barcode) {
        this.appRef.detachView(this.barcode!.hostView);
        this.barcode = null;
      }
    });
  }

  onError(error: any): void {
    this.error = error; // set error

    if (error.name === 'PasswordException') {
      const password = prompt('This document is password protected. Enter the password:');

      if (password) {
        this.error = null;
        this.setPassword(password);
      }
    }
  }

  setPassword(password: string): void {
    let newSrc: PDFSource;

    if (this.pdfFile.pdfSrc instanceof ArrayBuffer) {
      newSrc = { data: this.pdfFile.pdfSrc as any };
      // newSrc = { data: this.pdfFile.pdfSrc };
    } else if (typeof this.pdfFile.pdfSrc === 'string') {
      newSrc = { url: this.pdfFile.pdfSrc };
    } else {
      newSrc = { ...this.pdfFile.pdfSrc };
    }

    newSrc.password = password;

    this.pdfFile.pdfSrc = newSrc;
  }

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

  createBarcodePlaceholderComponent() {
    if (this.barcode) {
      this.barcode.destroy();
      this.barcode = null;
    }

    //- Add to DOM
    const componentRef = this.resolver
      .resolveComponentFactory(BarcodePlaceHolderComponent)
      .create(this.injector);

    componentRef.instance.top = 0 * this.lastContextMenu!.parent.clientHeight;

    componentRef.instance.left = 0 * this.lastContextMenu!.parent.clientWidth;

    componentRef.instance.width = 170;

    componentRef.instance.height = 100;

    componentRef.instance.pageNumber = parseInt(
      this.lastContextMenu!.parent.getAttribute('data-page-number')
    );

    componentRef.instance.parentHeight = this.lastContextMenu!.parent.clientHeight;
    componentRef.instance.parentWidth = this.lastContextMenu!.parent.clientWidth;

    if (!this.barcodeBase64Str) {
      this.onAddBarcode().subscribe((res) => {
        this.barcodeBase64Str = res;
        componentRef.instance.barcodeImageSrc = `data:image/png;base64,${this.barcodeBase64Str}`;
      });
    } else {
      componentRef.instance.barcodeImageSrc = `data:image/png;base64,${this.barcodeBase64Str}`;
    }

    this.appRef.attachView(componentRef.hostView);
    const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;

    this.barcode = componentRef;
    this.lastContextMenu!.parent.appendChild(domElem);
  }

  onAddBarcode(): Observable<string> {
    return this.manageSharedService.requestsService.getBarcode(this.data.requestId);
  }

  onSubmit(): void {
    if (this.data.fileType === '.pdf') {
      let position: {
        top: string;
        left: string;
        width: string;
        height: string;
        page: number;
      } = {
        top: '',
        left: '',
        width: '',
        height: '',
        page: 1,
      };

      if (this.barcode) {
        position = {
          page: this.barcode.instance.pageNumber,
          top: (100 * (this.barcode.instance.top / this.barcode.instance.parentHeight)).toFixed(3),
          left: (100 * (this.barcode.instance.left / this.barcode.instance.parentWidth)).toFixed(3),
          width: (100 * (this.barcode.instance.width / this.barcode.instance.parentWidth)).toFixed(
            3
          ),
          height: (
            100 *
            (this.barcode.instance.height / this.barcode.instance.parentHeight)
          ).toFixed(3),
        };

        this.manageImportsExportsService.wopiFilesService
          .updateBarcodePositionsOnPdfFile(this.data.fileId, {
            position,
            image: this.barcodeBase64Str,
          })
          .subscribe({
            next: (res) => {
              this.toastr.success(this.translateService.instant('shared.dataUpdatedSuccessfully'));
              this.dialogRef.close({
                status: 'Succeded',
                statusCode: ModalStatusCode.Success,
                data: {},
              });
            },
            error: (err) => {
              this.toastr.error(this.translateService.instant('shared.SomethingWentWrong'));
            },
          });

        return;
      }

      this.dialogRef.close({
        status: 'Succeded',
        statusCode: ModalStatusCode.Success,
      });
    }
    /* TXTextControl.saveDocument(
      streamTypeMapper[this.data.fileType],
      (e: {
        bytesWritten: number;
        data: string;
        streamType: EditorStreamType;
      }) => {
        const document = convertToIFormFile(
          e.data,
          this.data.fileName,
          this.data.fileType
        );

        this.dialogRef.close({
          status: 'Succeed',
          statusCode: ModalStatusCode.Success,
          data: {
            attachment: {
              file: document,
              fileType: this.data.fileType,
              fileName: this.data.fileName,
              fileId: this.data.fileId,
              filePath: this.data.filePath,
            },
          },
        });
      },
      undefined, //saveSettings callback function (optional)
      (err: any) => {
        }
    ); */
  }

  onCancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }
}

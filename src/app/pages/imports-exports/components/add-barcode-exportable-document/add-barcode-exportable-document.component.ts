import {
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
import { LanguageService } from '@core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { BarcodePlaceHolderComponent } from '@shared/components/barcode-place-holder/barcode-place-holder.component';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { ManageSharedService } from '@shared/services/manage-shared.service';
import { PDFSource, PdfViewerComponent } from 'ng2-pdf-viewer';

import { Observable } from 'rxjs';

@Component({
  host: { '(document:click)': 'hideContextMenu($event)' },

  selector: 'app-add-barcode-exportable-document',
  templateUrl: './add-barcode-exportable-document.component.html',
  styleUrls: [
    './add-barcode-exportable-document.component.scss',
    '../../pages/request-details/request-details.component.scss',
  ],
})
export class AddBarcodeExportableDocumentComponent implements OnInit {
  disableSubmitBtn: boolean = false;

  isFileLoading: boolean = true;
  // showHint: boolean = true;
  // showActionBar:boolean = true
  recordFile: {
    fileBlob: Blob | undefined;
    pdfSrc: string | Uint8Array | PDFSource | undefined;
    name: string;
  } = {
    fileBlob: undefined,
    pdfSrc: undefined,
    name: this.data.file.name,
  };

  lang: string = 'ar';

  readonly dropDownProperties = ['id', 'title', 'titleEn'];
  hideHint: boolean = true;
  hideActionBar: boolean = true;
  showBarcode: boolean = true;
  barcode!: ComponentRef<BarcodePlaceHolderComponent> | null;
  lastContextMenu!: { parent: any; x: number; y: number } | undefined;
  @ViewChild(PdfViewerComponent, { static: true })
  pdfViewer!: PdfViewerComponent;
  @ViewChild('contextmenuEl', { static: true }) contextmenuElement!: ElementRef;
  @ViewChild('pdfHolder', { static: true }) pdfholder!: ElementRef;
  showThumbnails = false;
  contextmenuOpened!: boolean;
  error: any;
  mode: string = '';
  barcodeBase64Str: string = '';
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      fileId: any;
      file: File;
      hideHint: boolean;
      hideActionBar: boolean;
      mode: string;
      exportId: any;
      showBarcode?: boolean;
    },

    private dialogRef: MatDialogRef<AddBarcodeExportableDocumentComponent>,
    private manageSharedService: ManageSharedService,
    private languageService: LanguageService,
    private injector: Injector,
    private appRef: ApplicationRef,
    private manageImportsExportsService: ManageImportsExportsService,
    private resolver: ComponentFactoryResolver,
    private toastr: CustomToastrService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.mode = this.data.mode || '';
    this.lang = this.languageService.language;
    this.viewFile();

    this.detectBarcodePlaceHolderDeletion();
    if (this.data) {
      this.hideHint = this.data.hideHint || false;
      this.hideActionBar = this.data.hideActionBar || false;
      this.showBarcode = this.data.showBarcode !== undefined ? this.data.showBarcode : true;
    }
  }

  viewFile(): void {
    this.isFileLoading = false;
    this.recordFile.fileBlob = this.data.file;
    this.recordFile.pdfSrc = URL.createObjectURL(this.data.file);
  }

  detectBarcodePlaceHolderDeletion(): void {
    this.manageSharedService.BarcodePlaceHoldersDeletion.subscribe({
      next: (toDelete) => {
        if (toDelete && this.barcode) {
          this.appRef.detachView(this.barcode!.hostView);
          this.barcode = null;
        }
      },
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

    if (this.recordFile.pdfSrc instanceof ArrayBuffer) {
      newSrc = { data: this.recordFile.pdfSrc as any };
      // newSrc = { data: this.recordFile.pdfSrc };
    } else if (typeof this.recordFile.pdfSrc === 'string') {
      newSrc = { url: this.recordFile.pdfSrc };
    } else {
      newSrc = { ...this.recordFile.pdfSrc };
    }

    newSrc.password = password;

    this.recordFile.pdfSrc = newSrc;
  }

  onSubmit(): void {
    let barcode: any = null;
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
        width: (100 * (this.barcode.instance.width / this.barcode.instance.parentWidth)).toFixed(3),
        height: (100 * (this.barcode.instance.height / this.barcode.instance.parentHeight)).toFixed(
          3
        ),
      };
      if (this.mode === 'edit') {
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
    }

    this.dialogRef.close({
      status: 'Succeded',
      statusCode: ModalStatusCode.Success,
      data: {
        barcode: position,
      },
    });
  }

  onClose(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
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
    if (this.mode === 'edit') {
      if (!this.barcodeBase64Str) {
        this.onAddBarcode().subscribe((res) => {
          this.barcodeBase64Str = res;
          componentRef.instance.barcodeImageSrc = `data:image/png;base64,${this.barcodeBase64Str}`;
        });
      } else {
        componentRef.instance.barcodeImageSrc = `data:image/png;base64,${this.barcodeBase64Str}`;
      }
    }

    componentRef.instance.barcodeImageSrc = 'assets/images/barcode.png';

    this.appRef.attachView(componentRef.hostView);
    const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;

    this.barcode = componentRef;
    this.lastContextMenu!.parent.appendChild(domElem);
  }
  onAddBarcode(): Observable<string> {
    return this.manageSharedService.requestsService.getBarcode(this.data.exportId);
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
}

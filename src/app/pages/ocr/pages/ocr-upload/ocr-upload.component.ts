import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { ManageOcrService } from '@pages/ocr/services/manage-ocr.service';
import { dataURLtoFile } from '@shared/helpers/helpers';
import { PDFSource } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-ocr-upload',
  templateUrl: './ocr-upload.component.html',
  styleUrls: ['./ocr-upload.component.scss'],
  host: {
    '(document:keydown.escape)': 'keyPressed($event)',
    '(document:mouseup)': 'removeSelectBox()',
  },
})
export class OcrUploadComponent implements OnInit {
  @ViewChild('dcanvas', { static: true }) dcanvas: any;
  @ViewChild('pdfcontainer', { static: true }) pdfcontainer: any;
  @ViewChild('hiddenFileToUpload') hiddenFileToUpload!: ElementRef;
  @ViewChild('tinyEditor') tinyEditor: any;

  numberControl = new FormControl();

  editorContent: string = '';
  parsedResponse: any[] = [];
  pdfSrc: string | Uint8Array | PDFSource | undefined = undefined; //"https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf";
  numText = '';
  isLoading = false;
  error: any;
  tinymceInstance: any;

  constructor(private manageOcrService: ManageOcrService, private toastr: CustomToastrService) {}

  ngOnInit() {
    this.numberControl.valueChanges.subscribe((e) => (this.numText = e));
  }

  onEditorInit(event: any) {
    this.tinymceInstance = event.editor;
    // Set content when editor is initialized
    if (this.editorContent) {
      this.tinymceInstance.setContent(this.editorContent);
      this.applyTextDirection();
    }
  }

  keyPressed(e: any) {
    //
    this.removeSelectBox();
  }

  dragleft(e: MouseEvent) {
    //
    this.pdfcontainer.nativeElement.style.border = 'none';
    this.preventDefault(e);
  }

  dragentered(e: MouseEvent) {
    this.pdfcontainer.nativeElement.style.border = '5px dashed green';
    this.preventDefault(e);
  }

  preventDefault(e: MouseEvent) {
    e.preventDefault();
  }

  selection = { x: 0, y: 0, width: 0, height: 0 };

  pageRendered(e: any) {
    let canvas = e.source.canvas;
    canvas.addEventListener('mousedown', (e: any) => this.startSelect(canvas, e));
  }

  mousemoveevent = (e: any) => this.resizeSelection(e);
  mouseupevent = (e: any) => this.endSelect(e);
  box = document.createElement('div');
  currentElement: HTMLElement | undefined = undefined;

  startSelect(canvas: any, e: MouseEvent) {
    canvas.addEventListener('mousemove', this.mousemoveevent);
    canvas.addEventListener('mouseup', this.mouseupevent);
    this.currentElement = canvas;

    //@ts-ignore
    this.selection.x = e.layerX;
    //@ts-ignore
    this.selection.y = e.layerY;
    this.box.style.border = '1px solid black';
    this.box.style.position = 'absolute';
    //@ts-ignore
    this.box.style.top = e.layerY + 'px';
    //@ts-ignore
    this.box.style.left = e.layerX + 'px';
    this.box.style.visibility = 'visible';
    this.box.style.pointerEvents = 'none';

    this.box.addEventListener('mousemove', (e) => e.preventDefault());
    //@ts-ignore
    let el: Element = e.srcElement['parentElement'];
    el.appendChild(this.box);
  }

  resizeSelection(e: MouseEvent) {
    //@ts-ignore
    this.selection.width = Math.abs(e.layerX - this.selection.x);
    //@ts-ignore
    this.selection.height = Math.abs(e.layerY - this.selection.y);
    this.box.style.width = this.selection.width + 'px';
    this.box.style.height = this.selection.height + 'px';
    //@ts-ignore
    this.box.style.top = Math.min(e.layerY, this.selection.y) + 'px';
    //@ts-ignore
    this.box.style.left = Math.min(this.selection.x, e.layerX) + 'px';
  }

  endSelect(e: any) {
    let top = Math.min(e.layerY, this.selection.y);
    let left = Math.min(this.selection.x, e.layerX);

    let start = {
      x: (left / e.srcElement.offsetWidth) * e.srcElement.width,
      y: (top / e.srcElement.offsetHeight) * e.srcElement.height,
    };
    let dims = {
      width: (this.selection.width / e.srcElement.offsetWidth) * e.srcElement.width,
      height: (this.selection.height / e.srcElement.offsetHeight) * e.srcElement.height,
    };

    let canvas = e.srcElement;

    setTimeout(() => {
      let context: CanvasRenderingContext2D = canvas.getContext('2d');
      let imagedata = context.getImageData(start.x, start.y, dims.width, dims.height);

      // Set dcanvas size to match selection
      this.dcanvas.nativeElement.width = Math.max(1, Math.round(dims.width));
      this.dcanvas.nativeElement.height = Math.max(1, Math.round(dims.height));

      let dcontext: CanvasRenderingContext2D = this.dcanvas.nativeElement.getContext('2d');
      dcontext.putImageData(imagedata, 0, 0);

      let base64Image = this.dcanvas.nativeElement.toDataURL();

      dcontext.clearRect(0, 0, this.dcanvas.nativeElement.width, this.dcanvas.nativeElement.height);

      this.isLoading = true;

      this.manageOcrService.ocrParserFilesService
        .uploadImage(dataURLtoFile(base64Image, 'test.png'))
        .subscribe(
          (res) => {
            this.isLoading = false;
            this.parsedResponse = res;
            this.editorContent = this.convertToHtml(this.parsedResponse);
            if (this.tinymceInstance) {
              this.tinymceInstance.setContent(this.editorContent);
              this.applyTextDirection();
            }
          },
          (err: any) => {
            this.isLoading = false;
          }
        );

      this.removeSelectBox();
    }, 1);
    this.isLoading = false;
  }

  removeSelectBox() {
    this.box.style.width = '0px';
    this.box.style.height = '0px';
    this.box.style.top = '0px';
    this.box.style.left = '0px';
    this.box.style.visibility = 'hidden';

    if (this.currentElement) {
      this.currentElement.removeEventListener('mousemove', this.mousemoveevent);
      this.currentElement.removeEventListener('mouseup', this.mouseupevent);
    }

    this.selection = { x: 0, y: 0, width: 0, height: 0 };
  }

  fileDropped(e: DragEvent) {
    e.preventDefault();
    this.uploadFile(e.dataTransfer!.files[0]);
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
    const maxSizeMB = 50;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      this.toastr.error(
        `File size exceeds ${maxSizeMB}MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(
          2
        )}MB`
      );
      return;
    }

    this.pdfSrc = URL.createObjectURL(file);
    this.error = null;

    //this.pdfcontainer.nativeElement.style.border = 'none';
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

  convertToHtml(items: any[]): string {
    if (!items || items.length === 0) return '';

    return items
      .map((item) => {
        const className = item.className ? `class="${item.className}"` : '';
        return `<p ${className}>${item.text || ''}</p>`;
      })
      .join('');
  }

  isArabicText(text: string): boolean {
    const arabicRegex = /[\u0600-\u06FF]/g;
    const englishRegex = /[a-zA-Z]/g;

    if (!text) return false;

    const arabicChars = text.match(arabicRegex);
    const englishChars = text.match(englishRegex);
    const totalChars = text.replace(/\s/g, '').length;

    const hasArabic = arabicChars && arabicChars.length / totalChars > 0.1;
    const hasEnglish = englishChars && englishChars.length / totalChars > 0.1;

    // If text has both Arabic and English, or if it has Arabic, return true (RTL)
    return hasArabic || (hasArabic && hasEnglish);
  }

  applyTextDirection(): void {
    if (!this.tinymceInstance) return;

    const isArabic = this.isArabicText(this.editorContent);
    const direction = isArabic ? 'rtl' : 'ltr';

    // Apply direction to the editor content
    this.tinymceInstance.dom.setAttrib(this.tinymceInstance.getBody(), 'dir', direction);

    // Apply text-align based on direction
    const alignment = isArabic ? 'right' : 'left';
    this.tinymceInstance.execCommand('mceToggleFormat', false, 'alignleft');
    this.tinymceInstance.execCommand('mceToggleFormat', false, 'alignright');
    this.tinymceInstance.execCommand(`mceToggleFormat`, false, `align${alignment}`);
  }
}

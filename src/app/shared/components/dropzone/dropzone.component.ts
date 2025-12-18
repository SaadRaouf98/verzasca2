import { MatDialog } from '@angular/material/dialog';
import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  AfterViewInit,
  OnChanges,
} from '@angular/core';
import { readFileAsUrl } from '../../helpers/helpers';
import { DropzoneService } from '../../services/dropzone.service';
import { ViewImageModalComponent } from '../view-image-modal/view-image-modal.component';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-dropzone',
  templateUrl: './dropzone.component.html',
  styleUrls: ['./dropzone.component.scss'],
})
export class DropzoneComponent implements OnInit, OnChanges {
  /* 
  selectedFile: string | ArrayBuffer = '';

  isImage = false;

  @Input() fileDescriptor: string = '';
  @Input() noTitle: boolean = false;
  @Input() existedFileUrl: string = '';
  @Input() touched: boolean = false;

  _fileExtensions: string[] = [];
  fileExtensionsStr: string = '';
  @Input() set fileExtensions(value: string[]) {
    this.fileExtensionsStr = value.toString();
    this._fileExtensions = value;
  }
  get fileExtensions(): string[] {
    return this._fileExtensions;
  }

  @Input() fileSize: number = 1;
  @Input() multiple: boolean = false;
  @Input() existedFilesNames: string[] = [];

  @Output() fileId: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('fileToUpload') fileToUpload: ElementRef = new ElementRef(null);

  filesArray: File[] = [];
  sizeLimitExceeded: boolean = false;
  fileUploadedSuccessfully: boolean = false;
  valid: boolean = false;

  @Input() cancelImage: boolean = false;
  constructor(
    private matDialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private dropzoneService: DropzoneService
  ) {}

  ngOnInit(): void {
    this.dropzoneService.getImageRemoveAction().subscribe((data: any) => {
      if (data.cancelImage) {
        this.resetDropzone();
      }
    });

  }

  checkImage(url: string) {
    let imgElement: HTMLImageElement = document.createElement('img');
    imgElement.src = url;
    imgElement.onerror = () => (this.isImage = false);
    imgElement.onload = () => (this.isImage = true);
  }

  resetDropzone() {
    this.valid = false;
    this.isImage = false;
    this.filesArray = [];
    this.touched = false;
    this.fileId.emit(undefined);
    //@ts-ignore
    this.selectedFile = undefined;
    //@ts-ignore
    this.existedFileUrl = undefined;
    this.fileUploadedSuccessfully = false;
    this.cdr.detectChanges();
    (this.fileToUpload.nativeElement as HTMLInputElement).value = '';
  }

  cancel() {
    this.resetDropzone();
    this.fileId.emit(undefined);
  }

  addFile(): void {
    let htmlElement: HTMLInputElement = this.fileToUpload.nativeElement;
    htmlElement.value = '';
    htmlElement.click();
  }

  onFileChange(e: any) {
    this.sizeLimitExceeded = false;
    this.filesArray = this.validateFiles(e.target.files);
    if (this.filesArray.length > 0) {
      this.uploadFiles();
      this.fileId.emit(e.target.files);
    } else {
      this.valid = false;
      this.touched = true;
    }
  }

  private getFilesNames(files: File[]): string[] {
    let filesNames: string[] = [];
    for (const file of files) {
      filesNames.push(file.name);
    }

    return filesNames;
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    (e.target as HTMLDivElement).classList.add('drag-over');
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    (e.target as HTMLDivElement).classList.remove('drag-over');
  }

  uploadFiles() {
    if (this.sizeLimitExceeded) {
      this.touched = true;
      this.filesArray = [];
      return;
    }
    this.fileUploadedSuccessfully = true;
    if (this.filesArray[0].type.includes('image')) {
      this.isImage = true;
      this.showImage();
    }

    this.valid = true;
    this.touched = true;
  }

  showImage() {
    if (this.filesArray.length == 1) {
      readFileAsUrl(this.filesArray[0]).subscribe((val) => {
        this.selectedFile = val;
      });
    }
  }

  viewImage() {
    this.matDialog.open(ViewImageModalComponent, {
      width: '600px',
      autoFocus: false,
      disableClose: false,
      data: this.selectedFile || this.existedFileUrl,
    });
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    //@ts-ignore
    this.filesArray = this.validateFiles(e.dataTransfer?.files);
    (e.target as HTMLDivElement).classList.remove('drag-over');
    if (this.filesArray.length > 0) {
      this.uploadFiles();
    }
  }

  private validateFiles(files: FileList): any[] {
    let filesArray = [];

    if (this.multiple) {
      for (let i = 0; i < files.length; i++) {
        //@ts-ignore
        filesArray = this.validateFileExtension(files[i]);
      }
    } else {
      //@ts-ignore
      filesArray = this.validateFileExtension(files[0]);
    }
    this.validateFilesSize(filesArray);

    return filesArray;
  }

  private validateFileExtension(file: File): any[] {
    let filesArray: File[] = [];
    let fileExtension: string = this.getFileExtension(file);
    for (const extension of this.fileExtensions) {
      if (fileExtension == extension) {
        filesArray.push(file);
      }
    }
    return filesArray;
  }

  
  private getFileExtension(file: File | string): string {
    //@ts-ignore
    return /.*(\..+)$/.exec(file instanceof File ? file.name : file)[1];
  }

  private validateFilesSize(files: File[]) {
    for (const file of files) {
      if (file.size / 1024 / 1024 > this.fileSize) {
        this.sizeLimitExceeded = true;
        return;
      }
    }
    this.sizeLimitExceeded = false;
  } */

  selectedFile!: string | ArrayBuffer | undefined;
  isImage = false;

  @Input() fileDescriptor!: string;
  @Input() canMinimize: boolean = false;
  @Input() noTitle: boolean = false;
  @Input() existedFileUrl!: string | undefined;
  @Input() touched: boolean = false;
  @Input() regularExpression!: RegExp | undefined;

  _fileExtensions!: string[];
  fileExtensionsStr!: string;
  @Input() set fileExtensions(value: string[]) {
    this.fileExtensionsStr = value.toString();
    this._fileExtensions = value;
  }
  get fileExtensions(): string[] {
    return this._fileExtensions;
  }

  _uploading: boolean = false;
  @Input() set uploading(value: boolean) {
    if (!value) {
      this.fileUploadedSuccessfully = false;
      this.existedFilesNames = undefined;
      this.existedFileUrl = undefined;
      if (this.fileToUpload) {
        (this.fileToUpload.nativeElement as HTMLInputElement).value = '';
      }
    }
    this._uploading = !!value;
  }
  get uploading(): boolean {
    return this._uploading;
  }

  @Input() fileSize: number = 1;
  @Input() multiple: boolean = false;
  @Input() existedFilesNames!: string[] | undefined;

  @Output() fileId: EventEmitter<any> = new EventEmitter<any>();
  @Output() filesNames: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Output() fileCurrentlyUploading: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() selectedFiles: EventEmitter<File[]> = new EventEmitter<File[]>();

  @ViewChild('fileToUpload') fileToUpload!: ElementRef;

  currentProgressPercentage = 0;
  filesArray!: File[];
  sizeLimitExceeded!: boolean;
  fileNameNotValid!: boolean;
  fileUploadedSuccessfully: boolean = false;
  valid: boolean = false;

  @Input() cancelImage!: boolean;
  constructor(
    private matDialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private dropzoneService: DropzoneService,
    private toastr: CustomToastrService
  ) {}

  ngOnInit(): void {
    this.dropzoneService.getImageRemoveAction().subscribe({
      next: (data: any) => {
        if (data.cancelImage) {
          this.resetDropzone();
        }
      },
    });

    this.checkImage(this.existedFileUrl);
  }

  ngOnChanges(data: any) {
    if (this.existedFileUrl) {
      this.checkImage(this.existedFileUrl);
    }
  }

  checkImage(url: string | undefined) {
    const imgElement: HTMLImageElement = document.createElement('img');
    imgElement.src = url as string;
    imgElement.onerror = () => (this.isImage = false);
    imgElement.onload = () => (this.isImage = true);
  }

  resetDropzone() {
    this.valid = false;
    this.isImage = false;
    this.filesArray = [];
    this.selectedFiles.emit(this.filesArray);
    this.currentProgressPercentage = 0;
    this.touched = false;
    this._uploading = false;
    this.fileCurrentlyUploading.emit(false);
    this.fileId.emit(undefined);
    this.selectedFile = undefined;
    this.existedFileUrl = undefined;
    this.fileUploadedSuccessfully = false;
    this.cdr.detectChanges();
    (this.fileToUpload.nativeElement as HTMLInputElement).value = '';
  }

  cancel() {
    this.resetDropzone();
    this.fileId.emit(undefined);
  }

  addFile(): void {
    const htmlElement: HTMLInputElement = this.fileToUpload.nativeElement;
    htmlElement.value = '';
    htmlElement.click();
  }

  onFileChange(e: any) {
    this.sizeLimitExceeded = false;
    this.fileNameNotValid = false;

    if (!this._uploading) {
      this.filesArray = this.validateFiles(e.target.files);
      if (this.filesArray.length > 0) {
        this.uploadFiles();
        this.filesNames.emit(this.getFilesNames(this.filesArray));
        this.selectedFiles.emit(this.filesArray);
      } else {
        this.valid = false;
        this.touched = true;
      }
    } else {
      this.touched = true;
    }
  }

  private getFilesNames(files: File[]): string[] {
    const filesNames: string[] = [];
    for (const file of files) {
      filesNames.push(file.name);
    }

    return filesNames;
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    if (!this._uploading) (e.target as HTMLDivElement).classList.add('drag-over');
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    if (!this._uploading) (e.target as HTMLDivElement).classList.remove('drag-over');
  }

  uploadFiles() {
    if (this.sizeLimitExceeded || this.fileNameNotValid) {
      this.touched = true;
      this.filesArray = [];
      return;
    }
    this._uploading = true;
    for (const file of this.filesArray) {
      this.fileUploadedSuccessfully = true;
      this.fileId.emit(this.filesArray);
      const img = this.filesArray[0].type;
      if (this.filesArray.length == 1 && this.filesArray[0].type.includes('image')) {
        this.isImage = true;
        this.showImage();
      }

      this.valid = true;
      this.touched = true;
    }
  }

  showImage() {
    if (this.filesArray.length == 1) {
      readFileAsUrl(this.filesArray[0]).subscribe({
        next: (val) => {
          this.selectedFile = val;
        },
      });
    }
  }

  viewImage() {
    this.matDialog.open(ViewImageModalComponent, {
      width: '600px',
      autoFocus: false,
      disableClose: false,
      data: this.selectedFile || this.existedFileUrl,
    });
  }

  onDrop(e: any): void {
    e.preventDefault();
    if (!this._uploading) {
      this.filesArray = this.validateFiles(e.dataTransfer.files);
      (e.target as HTMLDivElement).classList.remove('drag-over');
      if (this.filesArray.length > 0) {
        this.uploadFiles();
        this.selectedFiles.emit(this.filesArray);
      }
    }
  }

  private validateFiles(files: FileList): any[] {
    let filesArray = [];

    if (this.multiple) {
      for (let i = 0; i < files.length; i++) {
        filesArray = this.validateFileExtension(files[i]);
      }
    } else {
      filesArray = this.validateFileExtension(files[0]);
    }
    this.validateFilesSize(filesArray);
    this.validateFilesRegularExpression(filesArray);

    return filesArray;
  }

  private validateFileExtension(file: File): any[] {
    const filesArray: File[] = [];
    const fileExtension: string = this.getFileExtension(file);
    for (const extension of this.fileExtensions) {
      if (fileExtension == extension) {
        filesArray.push(file);
      }
    }
    return filesArray;
  }

  private validateFilesRegularExpression(files: File[]): void {
    if (this.regularExpression) {
      for (const file of files) {
        if (!this.regularExpression.test(file.name)) {
          this.fileNameNotValid = true;
          this.toastr.error('عفوا، اسم الملف يجب ألا يحتوي علي حروف أو أرقام خاصة');
          return;
        }
      }
      this.fileNameNotValid = false;
      return;
    }

    this.fileNameNotValid = false;
  }

  /**
   * Returns the file extension of the passed file
   *
   * @private
   * @param {File} file The file to get its extension
   * @return {string} The file extension
   * @memberof DropzoneComponent
   */
  private getFileExtension(file: File | string): string {
    return (/.*(\..+)$/.exec(file instanceof File ? file.name : file) as RegExpExecArray)[1];
  }

  private validateFilesSize(files: File[]) {
    for (const file of files) {
      if (file.size / 1024 / 1024 > this.fileSize) {
        this.sizeLimitExceeded = true;
        return;
      }
    }
    this.sizeLimitExceeded = false;
  }
}

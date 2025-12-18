import { Component, DestroyRef, inject, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LatestNewsCommand, LatestNewsDetails } from '@core/models/news-posts.model';
import { LanguageService } from '@core/services/language.service';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ManageLatestNewsService } from '@pages/latest-news/services/manage-latest-news.service';
import { isTouched, sharePointFileNameRegularExpression } from '@shared/helpers/helpers';

import { CommonModule, Location } from '@angular/common';
import { environment } from '@env/environment';
import { AuthService } from '@core/services/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ViewImageModalComponent } from '@shared/components/view-image-modal/view-image-modal.component';
import { SimplePdfModalComponent } from '@shared/components/simple-pdf-modal/simple-pdf-modal.component';
import { UploadAttachmentComponent } from '@shared/components/upload-attachment/upload-attachment.component';
import { FoundationDto, RegulatoryDocumentsDto } from '@pages/home/interfaces/policy.interface';
import { ManageHomeService } from '@pages/home/services/manage-home.service';
import { InputComponent } from '@shared/components/input/input.component';
import { SingleSelectComponent } from '@shared/components/single-select/single-select.component';
import { catchError, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { EditFileWithBarcodeModalComponent } from '@pages/imports-exports/modals/edit-file-with-barcode-modal/edit-file-with-barcode-modal.component';

@Component({
  selector: 'app-add-policy',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    UploadAttachmentComponent,
    FormsModule,
    ReactiveFormsModule,
    InputComponent,
    SingleSelectComponent,
  ],
  templateUrl: './add-policy.component.html',
  styleUrls: ['./add-policy.component.scss'],
})
export class AddPolicyComponent {
  categories: FoundationDto[] = [];
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  elementId: string = '';
  lang: string = 'ar';
  @ViewChild('uploadPdf') uploadPdfComponent: any;
  @ViewChild('uploadImage') uploadImageComponent: any;
  isDropZoneTouched: boolean = false;
  apiUrl = environment.apiUrl;
  isEditMode: boolean = false;
  newsImageData: any[] = [];
  regularExpression = sharePointFileNameRegularExpression;
  destroyRef = inject(DestroyRef);
  attachmentIds: string[] = [];
  uploadedFilesMeta: { name: string; id: string }[] = [];
  pdfFileId: string = '';
  pdfFileName: string = '';
  imageFileId: string = '';
  imageFileName: string = '';
  existingPdfFiles: any[] = [];
  existingImageFiles: any[] = [];
  visibleStatus = [
    { id: true, name: this.translateService.instant('shared.visible') },
    { id: false, name: this.translateService.instant('shared.invisible') },
  ];
  constructor(
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private languageService: LanguageService,
    private authService: AuthService,
    private manageHomeService: ManageHomeService,
    private manageImportsExportsService: ManageImportsExportsService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.getCategoriesData();
    this.lang = this.languageService.language;
    this.elementId = this.activatedRoute.snapshot.params['id'];

    if (this.elementId) {
      this.isEditMode = true;
      this.manageHomeService.getDataById(this.elementId).subscribe((outerRes) => {
        this.patchForm(outerRes);
        // if (outerRes.imagePath) {
        //   outerRes.imagePath.split('.');
        //   let document = outerRes.imagePath.split('.');
        //   let extension = document[document.length - 1];
        //   let path = outerRes.imagePath;
        //   let name = document[0] + '.' + extension;
        //   let documentObj = {
        //     name: name,
        //     contentType: extension,
        //     path: path,
        //   };
        //   this.newsImageData = outerRes.imagePath ? [documentObj] : [];
        // }
      });
    }
  }

  initializeForm(): void {
    this.form = new FormGroup({
      id: new FormControl(null, []),
      title: new FormControl(null, [Validators.required]),
      isActive: new FormControl(null, [Validators.required]),
      categoryId: new FormControl(null, [Validators.required]),
      fileId: new FormControl(null, [Validators.required]),
      thumbnailId: new FormControl(null, [Validators.required]),
    });
  }
  getCategoriesData(): void {
    this.manageHomeService
      .getCategoriesLookup()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((res) => {
          this.categories = res.data;
        }),
        catchError((err) => {
          this.categories = [];
          return [];
        })
      )
      .subscribe();
  }
  patchForm(data: RegulatoryDocumentsDto): void {
    this.form.patchValue({
      id: data.id,
      title: data.title,
      isActive: data.isActive,
      categoryId: data.category.id,
      fileId: data.file.id,
      thumbnailId: data.thumbnail.id,
    });

    // Set existing PDF file
    this.existingPdfFiles = [];
    if (data.file) {
      this.existingPdfFiles.push({
        id: data.file.id,
        name: data.file.name,
        path: data.file.path,
        length: data.file.length || 0,
      });
      this.pdfFileId = data.file.id;
      this.pdfFileName = data.file.name;
    }

    // Set existing image file
    this.existingImageFiles = [];
    if (data.thumbnail) {
      this.existingImageFiles.push({
        id: data.thumbnail.id,
        name: data.thumbnail.name,
        path: data.thumbnail.path,
        length: data.thumbnail.length || 0,
      });
      this.imageFileId = data.thumbnail.id;
      this.imageFileName = data.thumbnail.name;
    }
  }

  onSubmit(): void {
    console.log('form', this.form.value);
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    let { id, title, isActive, categoryId, fileId, thumbnailId } = this.form.value;

    if (this.elementId) {
      const dataToSend: any = {
        id,
        title,
        isActive,
        categoryId,
        fileId,
        thumbnailId,
      };

      console.log('dataToSend', dataToSend);

      this.manageHomeService.update(dataToSend).subscribe({
        next: (res) => {
          this.toastr.success(this.translateService.instant('shared.dataUpdatedSuccessfully'));
          this.navigateToTablePage();
        },
        error: (err) => {
          this.disableSubmitBtn = false;
        },
      });
    } else {
      this.manageHomeService
        .add({
          title,
          isActive,
          categoryId,
          fileId,
          thumbnailId,
        })
        .subscribe({
          next: (res) => {
            this.toastr.success(this.translateService.instant('shared.dataCreatedSuccessfully'));
            this.navigateToTablePage();
          },
          error: (err) => {
            this.disableSubmitBtn = false;
          },
        });
    }
  }

  onCancel() {
    this.form.reset();
    this.navigateToTablePage();
  }

  navigateToTablePage(): void {
    this.location.back();
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }

  getFileNameId(files: FileList): void {
    this.isDropZoneTouched = true;
    this.form.get('fileId')?.setValue(files?.[0]);
  }

  onFileRemoved(type: 'pdf' | 'image'): void {
    if (type === 'pdf') {
      this.form.patchValue({ fileId: '' });
      this.uploadedFilesMeta = this.uploadedFilesMeta.filter((f) => f.name !== this.pdfFileName);
      this.attachmentIds = this.attachmentIds.filter((id) => id !== this.pdfFileId);
      this.pdfFileId = '';
      this.pdfFileName = '';
    } else if (type === 'image') {
      this.form.patchValue({ thumbnailId: '' });
      this.uploadedFilesMeta = this.uploadedFilesMeta.filter((f) => f.name !== this.imageFileName);
      this.attachmentIds = this.attachmentIds.filter((id) => id !== this.imageFileId);
      this.imageFileId = '';
      this.imageFileName = '';
    }
  }
  onFileDropped(e: any, type: 'pdf' | 'image'): void {
    const files: File[] = [];
    for (const [key, value] of e.entries()) {
      if (value instanceof File) {
        files.push(value);
      }
    }

    // Get the correct component reference based on file type
    const uploadComponent = type === 'image' ? this.uploadImageComponent : this.uploadPdfComponent;

    files.forEach((file) => {
      this.manageImportsExportsService.wopiFilesService.createFile(file).subscribe((res) => {
        if (res) {
          // Store file IDs based on type
          if (type === 'pdf') {
            this.pdfFileId = res;
            this.pdfFileName = file.name;
            this.form.get('fileId')?.setValue(res);
          } else if (type === 'image') {
            this.imageFileId = res;
            this.imageFileName = file.name;
            this.form.get('thumbnailId')?.setValue(res);
          }

          this.uploadedFilesMeta = this.uploadedFilesMeta.filter((f) => f.name !== file.name);
          this.uploadedFilesMeta.push({ name: file.name, id: res });
          if (!this.attachmentIds.includes(res)) {
            this.attachmentIds = [...this.attachmentIds, res];
          }
          // Complete upload when API response is received - pass file ID for per-file progress
          if (uploadComponent) {
            // Find the uploaded file object by name and pass its ID to completeUpload
            const uploadedFile = uploadComponent.uploadedFiles.find(
              (f: any) => (f.file.name || f.file?.originalName) === file.name
            );
            if (uploadedFile) {
              uploadComponent.completeUpload(uploadedFile.id);
            }
          }
        }
      });
    });
  }

  onViewAttachment(file?: any): void {
    // If file is passed as parameter from upload component
    if (file && file.path) {
      const fileName = file.name ? file.name.toLowerCase() : '';
      const filePath = file.path;

      // Determine if it's an image or PDF based on file name
      if (fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i)) {
        // Fetch image using getFileByPath
        this.manageImportsExportsService.wopiFilesService.getFileByPath(filePath).subscribe({
          next: (res) => {
            const imageUrl = URL.createObjectURL(res);
            this.dialog
              .open(ViewImageModalComponent, {
                data: imageUrl,
                minWidth: '62.5rem',
                maxWidth: '62.5rem',
                maxHeight: '95vh',
                height: '95vh',
                panelClass: ['action-modal', 'float-footer'],
                autoFocus: false,
                disableClose: false,
              })
              .afterClosed()
              .subscribe(() => URL.revokeObjectURL(imageUrl));
          },
        });
      } else if (fileName.endsWith('.pdf')) {
        // Determine file type from file name
        let fileType = '.pdf';
        const attachment = {
          fileBlob: file.fileBlob || file.file || null,
          fileType: fileType,
          fileName: file.fileName || file.name || '',
          fileId: file.fileId || file.id || '',
          filePath: file.filePath || file.path || '',
        };
        console.log('attachment', attachment);
        this.manageImportsExportsService.wopiFilesService
          .getTemporaryFile(attachment.fileId)
          .subscribe({
            next: (res) => {
              this.dialog
                .open(EditFileWithBarcodeModalComponent, {
                  minWidth: '62.5rem',
                  maxWidth: '62.5rem',
                  maxHeight: '95vh',
                  height: '95vh',
                  panelClass: ['action-modal', 'float-footer'],
                  autoFocus: false,
                  disableClose: false,
                  data: {
                    fileBlob: res,
                    fileType: attachment.fileType,
                    fileName: attachment.fileName,
                    fileId: attachment.fileId,
                    filePath: attachment.filePath,
                    showBarcode: false,
                  },
                })
                .afterClosed()
                .subscribe((res) => {});
            },
          });
      } else {
        this.toastr.warning(
          this.translateService.instant('shared.unsupportedFileType') || 'Unsupported file type'
        );
      }
      return;
    }

    // If no file parameter, try to get from form
    const pdfFileId = this.form.get('fileId')?.value;
    const imageFileId = this.form.get('thumbnailId')?.value;

    if (pdfFileId instanceof File) {
      const objectUrl = URL.createObjectURL(pdfFileId);
      this.dialog
        .open(SimplePdfModalComponent, {
          data: objectUrl,
          width: '90vw',
          maxWidth: '1400px',
          height: '95vh',
          panelClass: 'custom-dialog-container',
        })
        .afterClosed()
        .subscribe(() => URL.revokeObjectURL(objectUrl));
    } else if (imageFileId instanceof File) {
      const objectUrl = URL.createObjectURL(imageFileId);
      this.dialog
        .open(ViewImageModalComponent, {
          data: objectUrl,
          width: '80vw',
          maxWidth: '1200px',
          panelClass: 'custom-dialog-container',
        })
        .afterClosed()
        .subscribe(() => URL.revokeObjectURL(objectUrl));
    }
  }
}

import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LatestNewsCommand, LatestNewsDetails } from '@core/models/news-posts.model';
import { LanguageService } from '@core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { ManageLatestNewsService } from '@pages/latest-news/services/manage-latest-news.service';
import { isTouched, sharePointFileNameRegularExpression } from '@shared/helpers/helpers';

import { Location } from '@angular/common';
import { environment } from '@env/environment';
import { AuthService } from '@core/services/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ViewImageModalComponent } from '@shared/components/view-image-modal/view-image-modal.component';
import { SimplePdfModalComponent } from '@shared/components/simple-pdf-modal/simple-pdf-modal.component';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-add-latest-news',
  templateUrl: './add-latest-news.component.html',
  styleUrls: ['./add-latest-news.component.scss'],
})
export class AddLatestNewsComponent {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  elementId: string = '';
  lang: string = 'ar';
  @ViewChild('uploadAttachment') uploadAttachmentComponent: any;
  isDropZoneTouched: boolean = false;
  apiUrl = environment.apiUrl;
  isEditMode: boolean = false;
  newsImageData: any[] = [];
  regularExpression = sharePointFileNameRegularExpression;
  visibleStatus = [
    { id: true, name: this.translateService.instant('shared.visible') },
    { id: false, name: this.translateService.instant('shared.invisible') },
  ];
  constructor(
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private manageLatestNewsService: ManageLatestNewsService,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private languageService: LanguageService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    this.lang = this.languageService.language;
    this.elementId = this.activatedRoute.snapshot.params['id'];

    if (this.elementId) {
      this.isEditMode = true;
      this.manageLatestNewsService.latestNewsService
        .getNewsPostById(this.elementId)
        .subscribe((outerRes) => {
          this.patchForm({
            id: outerRes.id,
            title: outerRes.title,
            definition: outerRes.definition,
            content: outerRes.content,
            isVisible: outerRes.isVisible,
            imagePath: outerRes.imagePath,
            creator: outerRes.creator,
          });
          if (outerRes.imagePath) {
            outerRes.imagePath.split('.');
            let document = outerRes.imagePath.split('.');
            let extension = document[document.length - 1];
            let path = outerRes.imagePath;
            let name = document[0] + '.' + extension;
            let documentObj = {
              name: name,
              contentType: extension,
              path: path,
            };
            this.newsImageData = outerRes.imagePath ? [documentObj] : [];
            console.log('this.newsImageData', this.newsImageData);
          }

          // this.manageLatestNewsService.latestNewsService
          //   .getNewsPostImageById(outerRes.imagePath)
          //   .subscribe((innerRes) => {
          //     this.newsImageData.push(outerRes.imagePath);
          //   });
        });
    }
  }

  initializeForm(): void {
    this.form = new FormGroup({
      id: new FormControl('', []),
      title: new FormControl('', [Validators.required]),
      definition: new FormControl('', []),
      content: new FormControl('', []),
      image: new FormControl('', [Validators.required]),
      imageUrl: new FormControl('', []),
      isVisible: new FormControl(null, []),
    });
  }

  patchForm(data: LatestNewsDetails): void {
    this.form.patchValue({
      id: data.id,
      title: data.title,
      definition: data.definition,
      content: data.content,
      image: data.imagePath,
      imageUrl: `${this.apiUrl}/api/v1/newsposts/images/${
        data.imagePath
      }?access_token=${this.authService.getToken()}`,
      isVisible: data.isVisible,
    });
  }

  onSubmit(): void {
    console.log('form', this.form.value);
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    let { id, title, definition, content, image, isVisible } = this.form.value;

    if (this.elementId) {
      const dataToSend: LatestNewsCommand = {
        id,
        title,
        definition,
        content,
        isVisible,
      };

      if (image.name) {
        dataToSend.image = image;
      }
      console.log('dataToSend', dataToSend);

      this.manageLatestNewsService.latestNewsService.updateNewsPost(dataToSend).subscribe({
        next: (res) => {
          this.toastr.success(this.translateService.instant('shared.dataUpdatedSuccessfully'));
          this.navigateToTablePage();
        },
        error: (err) => {
          this.disableSubmitBtn = false;
        },
      });
    } else {
      this.manageLatestNewsService.latestNewsService
        .addNewsPost({
          title,
          definition,
          content,
          image,
          isVisible,
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
    this.form.get('image')?.setValue(files?.[0]);
  }

  onExportFileRemoved(file: any): void {
    this.newsImageData = null;
    // Clear exportDocumentId so documentId is not sent in payload
    this.form.get('image')?.setValue(null);
  }
  onExportFileDropped(e: any): void {
    // this.newsImageData = e;
    // this.form.get('image')?.setValue(this.newsImageData?.[0]);
    for (const [key, value] of e.entries()) {
      if (value instanceof File) {
        this.form.get('image')?.setValue(value);
        this.newsImageData.push(value);
        this.uploadAttachmentComponent.completeUpload();

        if (this.uploadAttachmentComponent) {
          // Robust comparison for file name
          const uploadedFile = this.uploadAttachmentComponent.uploadedFiles.find((f: any) => {
            const fName = f.file.name || f.file?.originalName;
            return fName && value.name && fName.toLowerCase().trim() === value.name.toLowerCase().trim();
          });
          if (uploadedFile) {
            this.uploadAttachmentComponent.completeUpload(uploadedFile.id);
          }
        }
      }
    }
  }

  onViewAttachment(file?: File): void {
    const imageFile = this.form.get('image')?.value;

    // Check if it's a newly uploaded file from client side
    if (imageFile && imageFile instanceof File) {
      // Create a temporary object URL for the file
      const objectUrl = URL.createObjectURL(imageFile);

      // Determine if it's an image or PDF
      const fileType = imageFile.type;
      const fileName = imageFile.name.toLowerCase();

      if (fileType.startsWith('image/') || fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/)) {
        // Show image in ViewImageModalComponent
        this.dialog
          .open(ViewImageModalComponent, {
            data: objectUrl,
            width: '80vw',
            maxWidth: '1200px',
            panelClass: 'custom-dialog-container',
          })
          .afterClosed()
          .subscribe(() => {
            // Clean up the object URL after modal closes
            URL.revokeObjectURL(objectUrl);
          });
      } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        // Show PDF in modal
        const dialogRef = this.dialog.open(SimplePdfModalComponent, {
          data: objectUrl,
          width: '90vw',
          maxWidth: '1400px',
          height: '95vh',
          panelClass: 'custom-dialog-container',
        });

        dialogRef.afterClosed().subscribe(() => {
          URL.revokeObjectURL(objectUrl);
        });
      } else {
        this.toastr.warning(
          this.translateService.instant('shared.unsupportedFileType') || 'Unsupported file type'
        );
      }
    } else {
      // If no new file, fetch and stream the file from the URL (when editing)
      const imageUrl = this.form.get('imageUrl')?.value;
      const imagePath = this.form.get('image')?.value;

      if (imageUrl && imagePath) {
        // Helpers to detect and decode base64 responses
        const getExpectedMime = (name: string): string => {
          if (name.match(/\.(jpg|jpeg)$/)) return 'image/jpeg';
          if (name.endsWith('.png')) return 'image/png';
          if (name.endsWith('.gif')) return 'image/gif';
          if (name.endsWith('.bmp')) return 'image/bmp';
          if (name.endsWith('.webp')) return 'image/webp';
          if (name.endsWith('.svg')) return 'image/svg+xml';
          if (name.endsWith('.pdf')) return 'application/pdf';
          return 'application/octet-stream';
        };
        const extractBase64 = (input: string): string => {
          const m = input.match(/^data:[^;]+;base64,(.*)$/i);
          return (m ? m[1] : input).trim();
        };
        const isProbablyBase64 = (s: string): boolean => {
          // remove newlines
          const x = s.replace(/\s+/g, '');
          return /^[A-Za-z0-9+/=]+$/.test(x) && x.length % 4 === 0;
        };

        (async () => {
          try {
            const fileName = String(imagePath).toLowerCase();
            const expectedMime = getExpectedMime(fileName);
            const resp = await fetch(imageUrl, {
              headers: { Accept: `${expectedMime}, */*` },
            });
            if (!resp.ok) throw new Error('Failed to fetch file');

            // Clone to allow reading as text if needed
            const respClone = resp.clone();
            let blob = await resp.blob();

            // If we expect PDF or image but got text/plain or empty type, try base64 path
            const typeLower = (blob.type || '').toLowerCase();
            if (
              (expectedMime === 'application/pdf' || expectedMime.startsWith('image/')) &&
              (!typeLower || typeLower.startsWith('text/'))
            ) {
              try {
                const textPayload = await respClone.text();
                const base64 = extractBase64(textPayload);
                if (isProbablyBase64(base64)) {
                  const binStr = atob(base64);
                  const len = binStr.length;
                  const bytes = new Uint8Array(len);
                  for (let i = 0; i < len; i++) bytes[i] = binStr.charCodeAt(i);
                  blob = new Blob([bytes], { type: expectedMime });
                }
              } catch (_) {
                // ignore decode fallback errors
              }
            }

            // Ensure correct mime
            if (expectedMime !== 'application/octet-stream' && blob.type !== expectedMime) {
              blob = new Blob([blob], { type: expectedMime });
            }

            const objectUrl = URL.createObjectURL(blob);

            if (expectedMime.startsWith('image/')) {
              this.dialog
                .open(ViewImageModalComponent, {
                  data: objectUrl,
                  width: '80vw',
                  maxWidth: '1200px',
                  panelClass: 'custom-dialog-container',
                })
                .afterClosed()
                .subscribe(() => URL.revokeObjectURL(objectUrl));
            } else if (expectedMime === 'application/pdf') {
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
            } else {
              // Fallback open
              window.open(objectUrl, '_blank');
              setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
            }
          } catch (error) {
            console.error('Error fetching file:', error);
            this.toastr.error(
              this.translateService.instant('shared.errorLoadingFile') || 'Error loading file'
            );
          }
        })();
      } else {
        this.toastr.warning(
          this.translateService.instant('shared.noFileAvailable') || 'No file available to view'
        );
      }
    }
  }
}

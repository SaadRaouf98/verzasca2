import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatTabsModule } from '@angular/material/tabs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap, catchError, finalize, map, Observable, of } from 'rxjs';
import { FoundationDto } from '@pages/home/interfaces/policy.interface';
import { ManageHomeService } from '@pages/home/services/manage-home.service';
import { environment } from '@env/environment';
import { AuthService } from '@core/services/auth/auth.service';
import { downloadBlobOrFile, isSmallDeviceWidthForPopup } from '@shared/helpers/helpers';
import { Attachment } from '@core/models/request.model';
import { ViewAttachmentsModalComponent } from '@shared/components/view-attachments-modal/view-attachments-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '@core/services/api.service';
import { EditFileWithBarcodeModalComponent } from '@pages/imports-exports/modals/edit-file-with-barcode-modal/edit-file-with-barcode-modal.component';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { downloadFile } from '@shared/helpers/download.helper';
import { WopiFilesService } from '@core/services/backend-services/wopi-files.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-policies',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatTabsModule, RouterModule],
  templateUrl: './home-policies.component.html',
  styleUrls: ['./home-policies.component.scss'],
})
export class HomePoliciesComponent implements OnInit {
  destroyRef = inject(DestroyRef);
  private translate = inject(TranslateService);
  manageImportsExportsService = inject(ManageImportsExportsService);
  pageNumber: number = 0;
  pageSize: number = 100;
  items: FoundationDto[] = [];
  selectedCategoryData: any[] = [];
  selectedTabIndex: number = 0;
  token: string = '';
  protected readonly environment = environment;
  private imageUrlCache = new Map<string, Observable<string>>();
  constructor(
    private manageHomeService: ManageHomeService,
    private authService: AuthService,
    private dialog: MatDialog,
    private apiService: ApiService
  ) {
    this.token = this.authService.getToken();
  }

  ngOnInit(): void {
    this.getData();
  }

  preparePayload() {
    return {
      pageIndex: this.pageNumber,
      pageSize: this.pageSize,
    };
  }

  getData() {
    this.manageHomeService
      .getCategories()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((res) => {
          this.items = res.data;
        }),
        catchError((err) => {
          return [];
        }),
        finalize(() => {})
      )
      .subscribe();
  }

  onTabIndexChanged(index: number): void {
    this.selectedTabIndex = index;
    const item = this.items[index];

    if (item?.id) {
      const filterData = { categoryId: item.id };
      this.manageHomeService
        .getCategoryData(filterData)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap((res) => {
            this.selectedCategoryData = res.data;
          }),
          catchError((err) => {
            this.selectedCategoryData = [];
            return [];
          })
        )
        .subscribe();
    }
  }
  getDocument(file: Attachment) {
    this.manageImportsExportsService.wopiFilesService
      .getFileByPath(file?.path)
      .pipe(
        map((res) => {
          downloadFile(res, file.name);
        })
      )
      .subscribe();
  }

  onViewAttachments(file: any): void {
    let fileType = file.fileType || file.contentType || '';

    if (fileType.toLowerCase().includes('pdf')) {
      fileType = '.pdf';
    }

    const attachment = {
      fileBlob: file.fileBlob || file.file || null,
      fileType: fileType,
      fileName: file.fileName || file.name || '',
      fileId: file.fileId || file.id || '',
      filePath: file.filePath || file.path || '',
    };
    if (attachment.fileType === '.pdf') {
      //We need to fetch pdf file from server
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
                disableClose: true,
                data: {
                  fileBlob: res,
                  fileType: attachment.fileType, //.pdf
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
      //The file is not pdf,Just open the dialog
      this.dialog
        .open(EditFileWithBarcodeModalComponent, {
          minWidth: '62.5rem',
          maxWidth: '62.5rem',
          maxHeight: '95vh',
          height: '95vh',
          panelClass: ['action-modal', 'float-footer'],
          autoFocus: false,
          disableClose: true,
          data: {
            fileBlob: attachment.fileBlob,
            fileType: attachment.fileType, //.doc
            fileName: attachment.fileName,
            fileId: attachment.fileId,
            filePath: attachment.filePath,
          },
        })
        .afterClosed()
        .subscribe((res) => {});
    }
  }

  getImageUrl(path: string): Observable<string> {
    if (!path) {
      return of('assets/images/default-policy.png');
    }

    // Check cache first
    if (this.imageUrlCache.has(path)) {
      return this.imageUrlCache.get(path)!;
    }

    const imageUrl$ = this.manageImportsExportsService.wopiFilesService.getFileByPath(path).pipe(
      map((res) => {
        // Convert blob to URL
        return URL.createObjectURL(res);
      }),
      catchError(() => {
        // Return default image on error
        return of('assets/images/default-policy.png');
      })
    );

    // Cache the observable
    this.imageUrlCache.set(path, imageUrl$);
    return imageUrl$;
  }
}

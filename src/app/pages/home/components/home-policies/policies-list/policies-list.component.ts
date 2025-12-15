import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, finalize, map, tap, Observable, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Attachment } from '@core/models/request.model';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth/auth.service';
import { environment } from '@env/environment';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FoundationDto } from '@pages/home/interfaces/policy.interface';
import { ManageHomeService } from '@pages/home/services/manage-home.service';
import { EditFileWithBarcodeModalComponent } from '@pages/imports-exports/modals/edit-file-with-barcode-modal/edit-file-with-barcode-modal.component';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { downloadFile } from '@shared/helpers/download.helper';
import { Location } from '@angular/common';
import { PoliciesFilterComponent } from '../policies-filter/policies-filter.component';
import { FiltersComponent } from '@features/components/pending-request/pending-request-list/filters/filters.component';

@Component({
  selector: 'app-policies-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, FiltersComponent],
  templateUrl: './policies-list.component.html',
  styleUrls: ['./policies-list.component.scss'],
})
export class PoliciesListComponent implements OnInit {
  destroyRef = inject(DestroyRef);
  private translate = inject(TranslateService);
  manageImportsExportsService = inject(ManageImportsExportsService);
  private filtersDialogRef: MatDialogRef<PoliciesFilterComponent> | null = null;
  pageNumber: number = 0;
  pageSize: number = 100;
  policiesData: any[] = [];
  selectedTabIndex: number = 0;
  token: string = '';
  private globalClickUnlisten: (() => void) | null = null;
  clicked = false;
  isTableFiltered: boolean = false;
  protected readonly environment = environment;
  filteredData: { categoryId?: string; searchKeyword?: string } = {};
  private imageUrlCache = new Map<string, Observable<string>>();
  constructor(
    private manageHomeService: ManageHomeService,
    private authService: AuthService,
    private dialog: MatDialog,
    private renderer: Renderer2,
    private location: Location,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.token = this.authService.getToken();
  }

  ngOnInit(): void {
    this.getData();
  }
  getData(): void {
    this.manageHomeService
      .getCategoryData(this.filteredData, [{ selector: 'category.title', desc: false }])
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((res) => {
          this.policiesData = res.data;
        }),
        catchError((err) => {
          this.policiesData = [];
          return [];
        })
      )
      .subscribe();
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

  onFiltersChange(filtersData: any): void {
    console.log('Filters Data:', filtersData);
    const isReset = Object.keys(filtersData).length === 0;
    if (isReset) {
      this.isTableFiltered = false;
    } else {
      this.isTableFiltered = true;
    }
    this.filteredData = filtersData;
    this.getData();
  }
  onOpenSearch(event: MouseEvent): void {
    if (this.filtersDialogRef) {
      return;
    }
    this.clicked = true;
    const svgRect = (event.target as HTMLElement).getBoundingClientRect();
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const dialogWidth = 23.625 * rem;
    let top = svgRect.bottom + window.scrollY;
    let left = svgRect.left + window.scrollX + svgRect.width / 2 - dialogWidth / 2;
    this.filtersDialogRef = this.dialog.open(PoliciesFilterComponent, {
      // height: '450px',
      width: '23.625rem',
      hasBackdrop: false,
      position: {
        top: `${top}px`,
        left: `${left}px`,
      },
      disableClose: false,
      panelClass: 'filters-dialog-panel',
    });

    this.filtersDialogRef.afterOpened().subscribe(() => {
      const dialogComponent = this.filtersDialogRef!.componentInstance;
      dialogComponent.filtersChange.subscribe((dialogFilters: { categoryId: string }) => {
        this.onFiltersChange(dialogFilters);
      });
    });
    setTimeout(() => {
      const dialogContainer = document.querySelector('.mat-mdc-dialog-container') as HTMLElement;
      if (dialogContainer) {
        const actualWidth = dialogContainer.offsetWidth;
        const actualHeight = dialogContainer.offsetHeight;

        left = svgRect.left + window.scrollX + svgRect.width / 2 - actualWidth / 2;
        dialogContainer.style.left = `${left}px`;
        dialogContainer.style.top = `${top}px`;
      }

      // Listen for clicks outside the dialog
      this.globalClickUnlisten = this.renderer.listen(
        'document',
        'mousedown',
        (evt: MouseEvent) => {
          const dialogOverlay = document.querySelector('.cdk-overlay-container');
          const datepickerPopup = document.querySelector(
            '.mat-datepicker-content, .mat-mdc-datepicker-content'
          );
          const ngSelectDropdown = document.querySelector('.ng-dropdown-panel');
          const trigger = event.target as HTMLElement;

          if (
            (dialogOverlay && dialogOverlay.contains(evt.target as Node)) ||
            (datepickerPopup && datepickerPopup.contains(evt.target as Node)) ||
            (ngSelectDropdown && ngSelectDropdown.contains(evt.target as Node)) ||
            trigger.contains(evt.target as Node)
          ) {
            // Do nothing, click is inside dialog, popup, ng-select dropdown, or trigger
            return;
          }

          // Otherwise, close the dialog
          this.filtersDialogRef?.close();
        }
      );
    });

    this.filtersDialogRef.afterClosed().subscribe(() => {
      this.filtersDialogRef = null;
      this.clicked = false;
      this.changeDetectorRef.detectChanges();
      if (this.globalClickUnlisten) {
        this.globalClickUnlisten();
        this.globalClickUnlisten = null;
      }
    });
  }
  onNavigateBack(): void {
    this.location.back();
  }
}

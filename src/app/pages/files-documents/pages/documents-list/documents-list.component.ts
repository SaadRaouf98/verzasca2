import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, Type } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DocumentLibrary } from '@core/models/documents-library.model';
import { LanguageService } from '@core/services/language.service';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { TranslateService } from '@ngx-translate/core';
import { ManageFilesDocumentsService } from '@pages/files-documents/services/manage-files-documents.service';

import { switchMap, tap } from 'rxjs';
import { Location } from '@angular/common';
import { isSmallDeviceWidthForTable } from '@shared/helpers/helpers';
import { MatDialog } from '@angular/material/dialog';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { AuthService } from '@core/services/auth/auth.service';

@Component({
  selector: 'app-documents-list',
  templateUrl: './documents-list.component.html',
  styleUrls: ['./documents-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class DocumentsListComponent {
  documentsSource: MatTableDataSource<DocumentLibrary> = new MatTableDataSource<DocumentLibrary>(
    []
  );

  pageIndex: number = 0;
  pageSize: number = 20;
  length: number = 100000;
  pageEvent!: PageEvent;
  isLoading: boolean = true;
  sortData: {
    sortBy: string;
    sortType: SortDirection;
  } = {
    sortBy: '',
    sortType: '',
  };

  listView: 'grid' | 'table' = 'grid';
  uniqueId: string = '';
  path: string = '';
  directoryName: string = '';
  lang: string = 'ar';
  expandedElement!: DocumentLibrary | null;
  PermissionsObj = PermissionsObj;

  constructor(
    private manageFilesDocumentsService: ManageFilesDocumentsService,
    private activatedRoute: ActivatedRoute,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private router: Router,
    private langugaeService: LanguageService,
    private location: Location,
    private dialog: MatDialog,
    private authSevice: AuthService
  ) {}

  ngOnInit(): void {
    this.lang = this.langugaeService.language;

    this.activatedRoute.params
      .pipe(
        tap((params) => {
          this.uniqueId = params['uniqueId'];
          this.directoryName = params['name'];

          this.path = this.activatedRoute.snapshot.queryParams['path'] || '';
        }),
        switchMap(() => this.initializeList())
      )
      .subscribe();
  }

  initializeList() {
    this.isLoading = true;

    return this.manageFilesDocumentsService.documentsLibraryService
      .getDocumentsLibraryList(
        { pageIndex: this.pageIndex, pageSize: this.pageSize },
        { path: this.path?.replaceAll('-', '/'), uniqueId: this.uniqueId },
        this.sortData
      )
      .pipe(
        tap((res) => {
          this.isLoading = false;
          this.documentsSource = new MatTableDataSource(res.data);
          this.length = res.totalCount;
        })
      );
  }

  onPaginationChange(pageInformation: { pageSize: number; pageIndex: number }): void {
    this.pageSize = pageInformation.pageSize;
    this.pageIndex = pageInformation.pageIndex;

    this.initializeList().subscribe();
  }

  onSortColumn(sortInformation: { active: string; direction: SortDirection }): void {
    this.sortData = {
      sortBy: sortInformation.active,
      sortType: sortInformation.direction,
    };
    this.initializeList().subscribe();
  }

  onChangeListView(newView: 'grid' | 'table'): void {
    if (this.listView === newView) {
      return;
    }

    this.listView = newView;
  }

  onNavigateBack(): void {
    this.pageIndex = 0;
    this.location.back();
  }

  onOpenDirectory(document: DocumentLibrary): void {
    if (!document.isDirectory) {
      return;
    }
    this.router.navigate([`${document.uniqueId}/${document.name}`], {
      relativeTo: this.activatedRoute,
      queryParams: {
        path: document.path.replaceAll('/', '-'),
      },
    });
  }

  onSyncDocumentsLibrary(): void {
    this.manageFilesDocumentsService.documentsLibraryService
      .syncDocumentsLibrary(this.path)
      .subscribe({
        next: (res) => {
          if (res) {
            this.toastr.success(
              this.translateService.instant(
                'FilesDocumentsModule.DocumentsListComponent.syncFilesDocsSuccessfully'
              )
            );
            this.initializeList().subscribe();
          } else {
            this.toastr.error(this.translateService.instant('shared.SomethingWentWrong'));
          }
        },
      });
  }

  onViewFile(document: DocumentLibrary): void {
    if (document.contentType === '.pdf') {
      this.manageFilesDocumentsService.documentsLibraryService
        .viewFile(document.path, document.uniqueId)
        .subscribe((res) => {});
    } else if (
      document.contentType === '.jpg' ||
      document.contentType === '.jpeg' ||
      document.contentType === '.png' ||
      document.contentType === '.gif'
    ) {
      this.manageFilesDocumentsService.documentsLibraryService
        .getFile(document.path, document.uniqueId)
        .subscribe({
          next: (res) => {
            const blobUrl = URL.createObjectURL(res);

            window.open(blobUrl, '_blank');
          },
        });
    } else {
      window.open(document.url);
    }
  }

  getComponent(component: string) {
    return component as unknown as Type<any>; //component = 'ProductTitleComponent'
  }

  onDownloadFile(document: DocumentLibrary): void {
    this.manageFilesDocumentsService.documentsLibraryService
      .downloadFile(document.path, document.uniqueId, document.name)
      .subscribe((res) => {});
  }

  getFileImageSrc(contentType: string): string {
    if (contentType === '.pdf') {
      return 'assets/icons/pdf.png';
    }

    if (contentType === '.ppt' || contentType === '.pptx') {
      return 'assets/icons/power-point.png';
    }

    if (contentType === '.doc') {
      return 'assets/images/word.png';
    }

    if (
      contentType === '.jpg' ||
      contentType === '.jpeg' ||
      contentType === '.png' ||
      contentType === '.gif'
    ) {
      return 'assets/images/file.png';
    }

    return 'assets/images/file.png';
  }

  isMobileDeviceWidth(): boolean {
    return window.innerWidth <= 576;
  }

  isSmallDeviceWidthForTable(): boolean {
    return isSmallDeviceWidthForTable();
  }

  view_hide_element(element: DocumentLibrary): void {
    if (isSmallDeviceWidthForTable()) {
      if (JSON.stringify(this.expandedElement) === JSON.stringify(element)) {
        this.expandedElement = null;
      } else {
        this.expandedElement = element;
      }
    } else {
      this.onOpenDirectory(element);
    }
  }

  check_view_element(element: DocumentLibrary): boolean {
    if (JSON.stringify(this.expandedElement) === JSON.stringify(element)) {
      return true;
    } else {
      return false;
    }
  }

  return_displayed_columns(): string[] {
    if (isSmallDeviceWidthForTable()) {
      return ['name', 'actions'];
    } else {
      return [
        'icon',
        'name',
        'timeCreated',
        'timeLastModified',
        'authorName',
        'subDirectoryCount',
        'actions',
      ];
    }
  }
}

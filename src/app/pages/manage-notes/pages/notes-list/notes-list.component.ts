import { animate, state, style, transition, trigger } from '@angular/animations';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Injector,
  OnInit,
  Renderer2,
  ViewChild,
  inject,
} from '@angular/core';
import { b64toBlob, compareFn, removeSpecialCharacters } from '@shared/helpers/helpers';
import { Observable, tap } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ManageNotesService } from '@pages/manage-notes/services/manage-notes.service';
import { AllNotes, Note, NotesFiltersForm } from '@core/models/note.model';
import { Entity } from '@core/models/entity.model';
import { ExportedDocumentType } from '@core/enums/exported-docuemnt-type.enum';
import { FromDateToDateSearchService } from '@core/services/search-services/from-date-to-date-search.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotesFiltersComponent } from '../notes-filters/notes-filters.component';
import { FiltersComponent } from '@features/components/pending-request/pending-request-list/filters/filters.component';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { DomSanitizer } from '@angular/platform-browser';
import { PDFSource } from 'ng2-pdf-viewer';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ManageSharedService } from '@shared/services/manage-shared.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: [
    './notes-list.component.scss',
    '../../../manage-records/pages/records-list/records-list.component.scss',
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class NotesListComponent implements OnInit {
  activeTabIndex: number = 0; // Default to Letter tab
  notesSource: Note[] = [];
  priorityId: string;
  filtersData: NotesFiltersForm = {} as NotesFiltersForm;
  isTableFiltered: boolean = false;
  private globalClickUnlisten: (() => void) | null = null;
  pageIndex: number = 0;
  length: number = 0;
  isLoading: boolean = true;
  pageSize: number = 20;
  lang: string = 'ar';
  private filtersDialogRef: MatDialogRef<NotesFiltersComponent> | null = null;

  prioritiesList: Entity[] = [];
  usersList$: Observable<{
    data: {
      id: string;
      name: string;
    }[];
    totalCount: number;
    groupCount: number;
  }> = new Observable();
  classificationsList$: Observable<{
    data: {
      id: string;
      title: string;
      titleEn: string;
    }[];
    totalCount: number;
    groupCount: number;
  }> = new Observable();
  isNoteFileLoading: boolean = true;
  noteFile: {
    fileBase64: string | undefined;
    pdfSrc: string | Uint8Array | PDFSource | undefined;
    name: string;
  } = {
    fileBase64: undefined,
    pdfSrc: undefined,
    name: '',
  };
  activeCardId: string;
  ExportedDocumentType = ExportedDocumentType;
  @ViewChild(FiltersComponent) filtersComponent: FiltersComponent | undefined;

  placeholder: string = 'shared.day/month/year';
  destroyRef = inject(DestroyRef);
  compareFn = compareFn;
  readonly fromDateToDateSearchService = inject(FromDateToDateSearchService);

  constructor(
    private manageNotesService: ManageNotesService,
    private translateService: TranslateService,
    private toastr: CustomToastrService,
    private router: Router,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,
    injector: Injector,
    private dialog: MatDialog,
    private renderer: Renderer2,
    private changeDetectorRef: ChangeDetectorRef,
    private manageImportsExportsService: ManageImportsExportsService,
    private manageSharedService: ManageSharedService
  ) {}

  ngOnInit(): void {
    this.manageImportsExportsService.prioritiesService
      .getPrioritiesList(
        {
          pageSize: 50,
          pageIndex: 0,
        },
        undefined,
        undefined,
        ['id', 'title', 'titleEn']
      )
      .subscribe((res) => {
        this.prioritiesList = res.data;
      });
    this.setDocumentTypeByTab();
    this.initializeTable().subscribe();

    // this.detectFiltersChanges();
    this.manageSharedService.searchFormValue
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((filters: any) => {
        this.filtersData = filters;
        this.onFiltersChange(filters);
      });
  }

  initializeTable(): Observable<AllNotes> {
    this.isLoading = true;

    return this.manageNotesService.notesService
      .getNotesList({ pageIndex: this.pageIndex, pageSize: 10000 }, this.filtersData)
      .pipe(
        tap((res) => {
          this.isLoading = false;
          this.notesSource = res.data;
          this.notesSource.forEach((el) => {
            el.consultants.sort((a, b) => a.type - b.type);
            this.priorityId = this.filtersData.priorityId;
          });
          !this.notesSource[0]?.isRestricted ? this.loadNoteFile(this.notesSource[0]) : null;
          this.length = res.totalCount;
        })
      );
  }
  onTabClicked(event: MatTabChangeEvent): void {
    this.activeTabIndex = event.index;
    this.setDocumentTypeByTab();
    this.onFiltersChange({} as NotesFiltersForm);
  }

  onPaginationChange(pageInformation: { pageSize: number; pageIndex: number }): void {
    this.pageIndex = pageInformation.pageIndex;
    this.pageSize = pageInformation.pageSize;
    this.initializeTable().subscribe();
  }

  loadNoteFile(note) {
    if (note?.isRestricted || !note) return;
    this.activeCardId = note.id;
    this.isLoading = true;
    this.manageNotesService.notesService.getFile(note.id).subscribe((res) => {
      this.isLoading = false;
      this.noteFile.name = res.name;
      this.noteFile.fileBase64 = res.file;
      this.noteFile.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
        URL.createObjectURL(b64toBlob(this.noteFile.fileBase64, 'application/pdf'))
      );
    });
  }

  searchOnUsers(event: { term: string; items: any[] }): void {
    this.usersList$ = this.manageNotesService.usersService.getUsersList(
      {
        pageSize: 20,
        pageIndex: 0,
      },
      {
        searchKeyword: removeSpecialCharacters(event.term),
      }
    );
  }

  searchOnClassifications(event: { term: string; items: any[] }) {
    this.classificationsList$ =
      this.manageNotesService.classificationsService.getClassificationsList(
        {
          pageSize: 20,
          pageIndex: 0,
        },
        {
          searchKeyword: removeSpecialCharacters(event.term),
        },
        undefined,
        ['id', 'title', 'titleEn']
      );
  }

  onViewRequestContainerDetails(note: Note): void {
    const requestContainerId = note.requestContainer?.id;

    if (!requestContainerId) {
      this.toastr.error(
        this.translateService.instant('ManageNotesModule.NotesListComponent.nonRelatedToContainer')
      );
      return;
    }
    this.router.navigate(['transactions', requestContainerId]);
  }

  onViewNoteDetails(note: Note): void {
    if (!note?.isRestricted) {
      this.router.navigate([note.id], {
        relativeTo: this.activatedRoute,
      });
    }
  }

  onNavigateBack(): void {
    this.location.back();
  }
  clicked = false;
  onOpenSearch(event) {
    if (this.filtersDialogRef) {
      return;
    }

    this.clicked = true;
    const svgRect = (event.target as HTMLElement).getBoundingClientRect();
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const dialogWidth = 23.625 * rem;
    let top = svgRect.bottom + window.scrollY;
    let left = svgRect.left + window.scrollX + svgRect.width / 2 - dialogWidth / 2;
    this.filtersDialogRef = this.dialog.open(NotesFiltersComponent, {
      // height: '500px',
      width: '23.625rem',
      hasBackdrop: false,
      position: {
        top: `${top}px`,
        left: `${left}px`,
      },
      disableClose: false,
      panelClass: 'filters-dialog-panel',

      data: {
        lang: this.lang,
        filtersData: this.filtersData,
        prioritiesList: this.prioritiesList,
      },
    });

    this.filtersDialogRef.afterOpened().subscribe(() => {
      const dialogComponent = this.filtersDialogRef!.componentInstance;
      dialogComponent.filtersChange.subscribe((dialogFilters: NotesFiltersForm) => {
        this.onFiltersChange(dialogFilters);
      });
      dialogComponent.resetRequested.subscribe(() => {
        this.resetAllFiltersFromDialog();
      });
    });
    this.filtersDialogRef.afterClosed().subscribe(() => {
      const dialogComponent = this.filtersDialogRef!.componentInstance;
      dialogComponent.filtersChange.subscribe((dialogFilters: NotesFiltersForm) => {
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
          const trigger = event.target as HTMLElement;

          if (
            (dialogOverlay && dialogOverlay.contains(evt.target as Node)) ||
            (datepickerPopup && datepickerPopup.contains(evt.target as Node)) ||
            trigger.contains(evt.target as Node)
          ) {
            // Do nothing, click is inside dialog, popup, or trigger
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
  onFiltersChange(filtersData: NotesFiltersForm) {
    if (!filtersData) {
      filtersData = {};
    }

    const isReset = Object.keys(filtersData).length === 0;
    if (isReset) {
      this.isTableFiltered = false;
    } else {
      this.isTableFiltered = true;
    }
    this.filtersData = {
      searchKeyword: removeSpecialCharacters(filtersData?.searchKeyword || ''),
      priorityId: filtersData?.priorityId || filtersData?.priority || '',
      consultantId: filtersData?.consultantId || '',
      classificationId: filtersData?.classificationId || '',
      isInitiated: filtersData?.isInitiated,
      isSigned: filtersData?.isSigned,
      fromDate: filtersData?.fromDate,
      toDate: filtersData?.toDate,
      hijriFromDate: filtersData?.hijriFromDate,
      hijriToDate: filtersData?.hijriToDate,
    };
    this.setDocumentTypeByTab();

    this.pageIndex = 0;
    this.initializeTable().subscribe();
  }

  resetAllFiltersFromDialog() {
    this.onFiltersChange({} as NotesFiltersForm);
    if (this.filtersComponent) {
      this.filtersComponent.resetAllFilters();
    }
  }

  private setDocumentTypeByTab(): void {
    if (this.activeTabIndex === 0) {
      this.filtersData.documentType = this.ExportedDocumentType.Note.toString();
    } else {
      this.filtersData.documentType = this.ExportedDocumentType.Letter.toString();
    }
  }
  consulatntType: string = '';
  showConsultant(type: number, element, index: number) {
    element.hoveredConsultantIndex = index;
    element.consultantType =
      type === 1
        ? 'ConsultantsTypeList.MainConsultant'
        : (element.consultantType =
            type === 2
              ? 'ConsultantsTypeList.CoordinatingSubConsultant'
              : 'ConsultantsTypeList.ParticipatingSubConsultant');
  }
}

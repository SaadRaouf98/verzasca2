import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChange,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ExportedDocumentType } from '@core/enums/exported-docuemnt-type.enum';
import { ImportExport } from '@core/models/import-export.model';
import { LanguageService } from '@core/services/language.service';
import {
  isSmallDeviceWidthForPopup,
  isSmallDeviceWidthForTable,
} from '@shared/helpers/helpers';
import { ViewAttachmentsModalComponent } from '../view-attachments-modal/view-attachments-modal.component';
import { RequestsService } from '@core/services/backend-services/requests.service';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-imports-exports-scrollable-table',
  templateUrl: './imports-exports-scrollable-table.component.html',
  styleUrls: ['./imports-exports-scrollable-table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class ImportsExportsScrollableTableComponent
  implements OnInit, OnChanges
{
  columns: string[] = [];
  columnsConfig: any[] = [];
  @Input() isLoading: boolean = false; // Add @Input() decorator
  @Input() isError: boolean = false;

  importsExportsSource: MatTableDataSource<ImportExport> =
    new MatTableDataSource<ImportExport>([]);
  pageIndex: number = 0;
  pageSize: number = 20;
  length: number = 100000;
  displayedColumns: string[] = [
    'number',
    'requestType',
    'isExportDocument',
    'title',
    'date',
    'actions',
  ];
  expandedElement!: ImportExport | null;
  lang: string = 'ar';

  ExportedDocumentType = ExportedDocumentType;

  @Input() data!: ImportExport[];
  @Output() element: EventEmitter<ImportExport> = new EventEmitter();

  constructor(
    private dialog: MatDialog,
    private requestsService: RequestsService,
    private langugaeService: LanguageService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.lang = this.langugaeService.language;
    this.initializeColumns();
    this.initializeColumnConfig();
  }

  ngOnChanges(changes: { data: SimpleChange }): void {
    if (changes.data.currentValue) {
      this.importsExportsSource = new MatTableDataSource(
        changes.data.currentValue
      );
      this.length = this.importsExportsSource.data.length;
    }
  }

  initializeColumns() {
    this.columns = [
      'formattedRequestType',
      'number',
      'isExportDocument',
      'title',
      'date',
      'actions',
    ];
  }
  initializeColumnConfig() {
    this.columnsConfig = [
      {
        label: 'shared.actionNumber',
        type: 'text',
      },
      {
        label: 'shared.categorization',
        type: 'text',
      },

      {
        label: 'shared.type',
        type: 'importOrExport',
      },
      {
        label: 'shared.title',
        type: 'text',
      },
      {
        label: 'shared.date',
        type: 'dateTime',
      },
      {
        label: 'shared.action',
        type: 'actions',
        actions: [
          {
            action: 'view',
            isHidden: 'viewWatchButton',
            onClick: (element: any) => {
              if (element.viewWatchButton) {
                if (element.isExportDocument) {
                  this.router.navigate([
                    '/imports-exports/' +
                      element.id +
                      '/exportable-document-details',
                  ]);
                } else {
                  this.router.navigate([
                    '/imports-exports/' + element.id + '/request-details',
                  ]);
                }
              }
              if (!element.isRestricted && element.isExportDocument) {
                this.router.navigate(
                  ['/imports-exports/exportId/' + element.id + '/viewer'],
                  {
                    queryParams: {
                      name: element.title,
                    },
                  }
                );
              }
            },
          },
          {
            action: 'edit',
            onClick: (element: any) => {
              if (element.isExportDocument) {
                //It is exported document
                this.router.navigate(
                  [`/imports-exports/${element.id}/export`],
                  {
                    relativeTo: this.activatedRoute,
                  }
                );
                return;
              }
              this.router.navigate([`/imports-exports/${element.id}/import`], {
                relativeTo: this.activatedRoute,
              });
            },
          },
        ],
      },
    ];
  }
  onViewFiles(element: ImportExport): void {
    //الملف وارد
    this.requestsService
      .getImportAttachmentsList(element.id)
      .subscribe((res) => {
        this.dialog.open(ViewAttachmentsModalComponent, {
          width: isSmallDeviceWidthForPopup() ? '95vw' : '1000px',
          autoFocus: false,
          disableClose: false,
          data: {
            attachments: res,
          },
        });
      });
  }

  view_hide_element(element: ImportExport): void {
    if (isSmallDeviceWidthForTable()) {
      if (JSON.stringify(this.expandedElement) === JSON.stringify(element)) {
        this.expandedElement = null;
      } else {
        this.expandedElement = element;
      }
    }
  }

  check_view_element(element: ImportExport): boolean {
    if (JSON.stringify(this.expandedElement) === JSON.stringify(element)) {
      return true;
    } else {
      return false;
    }
  }
}

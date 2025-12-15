import { ChangeDetectorRef, Component, OnInit, OnDestroy, inject, DestroyRef } from '@angular/core';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { DeletePopupComponent } from '@shared/new-components/delete-popup/delete-popup.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {
  RequestContainerStatus,
  statusTranslationMap,
} from '@core/enums/request-container-status.enum';
import { ImportExport } from '@core/models/import-export.model';
import { LanguageService } from '@core/services/language.service';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import {
  base64ToArrayBuffer,
  isPdfFile,
  convertEnglishToArabicNumbers,
  formatDateToYYYYMMDD,
  isSmallDeviceWidthForPopup,
  padToFourDigits,
} from '@shared/helpers/helpers';

import {
  Action,
  Attachment,
  CommitteeApproval,
  CommitteeApprovalRealTime,
  RelatedRequestScrollableTable,
  RequestAssigningReceiverRealTime,
  RequestDetails,
  RequestExportRecommendation,
  RequestTimeLine,
} from '@core/models/request.model';
import { LinkTransactionComponent } from '@pages/imports-exports/components/link-transaction/link-transaction.component';
import { RequestAction } from '@core/models/request-action.model';
import { RequestStatus } from '@core/enums/request-status.enum';
import { ActionType } from '@core/enums/action-type.enum';
import { AcceptanceActionModalComponent } from '@shared/components/acceptance-action-modal/acceptance-action-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { ConsultantsAssignmentModalComponent } from '@shared/components/consultants-assignment-modal/consultants-assignment-modal.component';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { Location } from '@angular/common';
import { DelegateUserModalComponent } from '@shared/components/delegate-user-modal/delegate-user-modal.component';
import { SelectRecommendationTypeModalComponent } from '@shared/components/select-recommendation-type-modal/select-recommendation-type-modal.component';
import { SelectBenefitTypeModalComponent } from '@shared/components/select-benefit-type-modal/select-benefit-type-modal.component';
import { SelectProcessTypeModalComponent } from '@shared/components/select-process-type-modal/select-process-type-modal.component';
import { CommentModalComponent } from '@shared/components/comment-modal/comment-modal.component';
import { Transaction } from '@core/models/transaction.model';
import { Observable, map, forkJoin, catchError, of, tap, switchMap, takeUntil } from 'rxjs';
import { StudyProjectModalComponent } from '@shared/components/study-project-modal/study-project-modal.component';
import { StatementRequestModalComponent } from '@shared/components/statement-request-modal/statement-request-modal.component';
import { SignatureFormatModalComponent } from '@shared/components/signature-format-modal/signature-format-modal.component';
import { ExportedDocumentType } from '@core/enums/exported-docuemnt-type.enum';
import { InitiateModalComponent } from '@shared/components/initiate-modal/initiate-modal.component';
import { SummarizeExportDocumentModalComponent } from '@shared/components/summarize-export-document-modal/summarize-export-document-modal.component';
import { ExportTemplateModalComponent } from '@shared/components/export-template-modal/export-template-modal.component';
import { ExportModalComponent } from '@shared/components/export-modal/export-modal.component';
import { AuditingModalComponent } from '@shared/components/auditing-modal/auditing-modal.component';
import { InternalAssignmentUserModalComponent } from '@shared/components/internal-assignment-user-modal/internal-assignment-user-modal.component';
import { ReUploadDocumentModalComponent } from '@shared/components/re-upload-record-modal/re-upload-document-modal.component';
import printJS from 'print-js';
import { ResetRequestModalComponent } from '@pages/imports-exports/components/reset-request-modal/reset-request-modal.component';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { environment } from '@env/environment';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MemberApprovalType } from '@core/enums/member-approval-type.enum';
import { ViewNoteModalComponent } from '@pages/manage-records/components/view-note-modal/view-note-modal.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { TakeCommitteeMemberApprovalActionComponent } from '@pages/imports-exports/modals/take-committee-member-approval-action/take-committee-member-approval-action.component';
import {
  getBarcodeWithBackground,
  getBarcodeWithOUTBackground,
} from '@pages/imports-exports/statics/barcode-background';
import { DetailedUser, User } from '@core/models/user.model';
import { UsersService } from '@core/services/backend-services/users.service';
import { UploadCommitteeApprovalFileModalComponent } from '@shared/components/upload-committee-approval-file-modal/upload-committee-approval-file-modal.component';
import { downloadFile } from '@shared/helpers/download.helper';
import { FormControl } from '@angular/forms';
import { AddAttachmentComponent } from '@features/components/pending-request/pending-request-view/add-attachment/add-attachment.component';
import { TransactionNumberPipe } from '@shared/pipes/transaction-number.pipe';
import { RescheduleMeetingComponent } from '@features/components/pending-request/pending-request-view/reschedule-meeting/reschedule-meeting.component';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-request-details',
  templateUrl: './request-details.component.html',
  styleUrls: ['./request-details.component.scss'],
})
export class RequestDetailsComponent implements OnInit {
  destroyRef = inject(DestroyRef);
  elementId: string = '';
  requestDetails!: RequestDetails;
  requestContainerDetails!: Transaction;
  requestTimeLine: RequestTimeLine[] = [];
  requestExportRecommendation!: RequestExportRecommendation;
  committeeMembersApprovals: CommitteeApproval[] = [];
  MemberApprovalType = MemberApprovalType;
  importsExports: any[] = [];
  relatedRequests: any[] = [];
  lang: string = 'ar';
  RequestContainerStatus = RequestContainerStatus;
  statusTranslationMap = statusTranslationMap;
  RequestStatus = RequestStatus;
  currentUser!: User;
  requestActions: RequestAction[] = [];
  isLoading: boolean = false;
  panelProcedureState: boolean = false;
  panelTimelineState: boolean = false;
  panelApprovalState: boolean = false;
  ExportedDocumentType = ExportedDocumentType;
  environment = environment;
  selectedActionId: any = null;
  PermissionsObj = PermissionsObj;
  selectedAction: Action | null = null;
  selectedForDelete: boolean = false;
  tabsLoading: {
    tab1: boolean;
    tab2: boolean;
    tab3: boolean;
  } = {
    tab1: true,
    tab2: true,
    tab3: true,
  };
  displayProgressSpinner: boolean = false;
  showRescheduleConfirmation: boolean = false;
  showResignConfirmation: boolean = false;
  iconActions = [
    {
      icon: 'operationUrl',
      iconActive: 'operationUrl-active',
      classActive: 'link',
      label: 'ImportsExportsModule.RequestDetailsComponent.operationUrl',
      height: '1.4rem',
      width: '1.1rem',
      callback: (event: MouseEvent) => this.onIconActionClick(event, 0),
    },
    {
      icon: 'settings',
      label: 'ImportsExportsModule.RequestDetailsComponent.settings',
      height: '1.5rem',
      width: '1.5rem',
      callback: () => this.onIconActionClick(null, 1),
    },
    {
      icon: 'printer',
      label: 'shared.printBarcode',
      height: '1.5rem',
      width: '1.5rem',
      callback: () => this.onIconActionClick(null, 2),
    },
    {
      icon: 'printer',
      label: 'shared.printBarcodeWithoutBackground',
      height: '1.5rem',
      width: '1.5rem',
      callback: () => this.onIconActionClick(null, 3),
    },
  ];

  activeIconIndex: number | null = null;

  onIconActionClick(event: MouseEvent | null, index: number) {
    this.activeIconIndex = index;
    switch (index) {
      case 0:
        this.onLinkTransaction(event!);
        break;
      case 1:
        this.onResetRequest();
        break;
      case 2:
        this.onPrintBarcode();
        break;
      case 3:
        this.onPrintBarcode(false);
        break;
    }
  }
  sortAsc = true;
  selectedTabIndex = 0;
  columns: string[] = [];
  columnsConfig: any[] = [];
  items: Attachment[] = [];
  isTableLoading: boolean = false;
  isTableError: boolean = false;

  isLoadingImport: boolean = false;
  isErrorImport: boolean = false;
  fileBlob: Blob | null = null;
  fromImports: boolean = false;
  constructor(
    private manageImportsExportsService: ManageImportsExportsService,
    private toastr: CustomToastrService,
    private activatedRoute: ActivatedRoute,
    private languageService: LanguageService,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private router: Router,
    private location: Location,
    private clipboard: Clipboard,
    private cdr: ChangeDetectorRef,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.elementId = params['id'];
      this.selectedTabIndex = 0; // Reset to first tab on ID change
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.initializePageData();
    });
    this.activatedRoute.queryParams.subscribe((queryParams) => {
      this.fromImports = queryParams['from'] === 'imports';
    });
    this.lang = this.languageService.language;
    this.initializeColumns();
    this.initializeColumnConfig();
    this.getCurrentUser();
    this.getTimelineData();
  }
  initializeColumns() {
    this.columns = ['name', 'createdByName', 'actions'];
  }

  deleteItem() {
    console.log(document);
    const filtersDialogRef = this.dialog.open(DeletePopupComponent, {
      data: {
        title: this.translateService.instant(
          'RegularReportsModule.AddRegularReportComponent.deletePopupTitle'
        ),
        message: `${this.translateService.instant(
          'RegularReportsModule.AddRegularReportComponent.deletePopupMessage'
        )} `,
      },
      disableClose: true,
    });

    filtersDialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.isLoading = true;

        this.manageImportsExportsService.requestsService
          .deleteRequest(this.elementId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.isLoading = false;
              this.toastr.success(this.translateService.instant('shared.deletedSuccessfully'));
              // navigate to parent route (same URL without id)
              let url = this.router.url.split('/')[1];
              this.router.navigateByUrl(url);
            },
            error: (err) => {
              this.isLoading = false;
              this.toastr.error(
                this.translateService.instant('shared.deleteFailed') || 'Delete failed'
              );
            },
          });
      }
    });
  }
  initializeColumnConfig() {
    this.columnsConfig = [
      {
        label: 'shared.name',
        type: 'textWithDetails',
        subTitle: ['contentType', 'length'],
      },
      {
        label: 'shared.by',
        type: 'textWithDetails',
        subTitle: 'createdByEmail',
      },
      {
        label: 'shared.action',
        type: 'actionsMenu',
        actions: [
          {
            action: 'view',
            actionName: 'shared.viewFile',
            icon: 'menu-view',
            onClick: (element: any) => {
              this.router.navigate(['/imports-exports/attachments/' + element.id], {
                queryParams: { name: element.name },
              });
            },
          },
          {
            action: 'download',
            actionName: 'shared.download',
            icon: 'menu-download',
            onClick: (element: any) => {
              this.getDocument(element).subscribe();
            },
          },
          {
            action: 'delete',
            actionName: 'shared.deleteFile',
            icon: 'menu-delete',
            onClick: (element: any) => {
              this.Delete(element);
            },
          },
        ],
      },
    ];
  }
  getCurrentUser(): void {
    this.usersService
      .getCurrentUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (res) {
          this.currentUser = res;
        }
      });
  }
  private getDocument(data: Attachment): Observable<Blob> {
    return this.manageImportsExportsService.requestsService
      .getNewRequestSingleAttachment(data?.id)
      .pipe(
        map((res) => {
          this.fileBlob = res;
          this.onDownloadFile(data);
          return res;
        })
      );
  }
  onDownloadFile(data: Attachment): void {
    if (this.fileBlob) {
      downloadFile(this.fileBlob, data.name);
    } else {
      this.toastr.warning(this.translateService.instant('shared.waitUntilFileIsLoaded'));
    }
  }
  onSelectDelete() {
    this.selectedForDelete = true;
    this.selectedActionId = null;
  }
  Delete(data: Attachment) {
    const dialogRef = this.dialog.open(DeletePopupComponent, {
      data: {
        title: 'shared.deleteTitle',
        message: this.translateService.instant('shared.deleteMessage', {
          name: data?.name,
        }),
      },
      width: '500px',
      scrollStrategy: new NoopScrollStrategy(),
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.manageImportsExportsService.requestsService
          .deleteAttachment(data?.id, this.elementId)
          .pipe(
            takeUntilDestroyed(this.destroyRef),
            tap((resp: any) => {
              this.items = this.items.filter((x) => x?.id != data?.id);
              this.toastr.success(this.translateService.instant('shared.fileDeletedSuccessfully'));
            })
          )
          .subscribe();
      }
    });
  }
  addAttachDialog() {
    const dialogRef = this.dialog.open(AddAttachmentComponent, {
      data: {},
      width: '38.75rem',
      scrollStrategy: new NoopScrollStrategy(),
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        const payload = {
          attachmentsIds: res,
        };
        this.manageImportsExportsService.requestsService
          .addAttachment(this.elementId, payload)
          .pipe(
            takeUntilDestroyed(this.destroyRef),
            tap((resp: any) => {
              this.getAttachments();
              this.toastr.success(this.translateService.instant('shared.fileAddedSuccessfully'));
            })
          )
          .subscribe();
      }
    });
  }
  initializePageData(): void {
    this.isLoading = true;

    let requests: Observable<any>[] = [];

    requests.push(
      this.manageImportsExportsService.requestsService.getRequestById(this.elementId).pipe(
        map((res) => {
          if (res) {
            this.requestDetails = res;
            this.initRealTimeToGetRequestAssigningReceiver();
          }
        })
      )
    );

    requests.push(
      this.manageImportsExportsService.requestsService.getRequestTimeLine(this.elementId).pipe(
        map((res) => {
          if (res) {
            this.requestTimeLine = res;
          }
        })
      )
    );

    forkJoin(requests).subscribe({
      next: (res) => {
        requests = [];

        if (this.requestDetails.requestContainer?.id) {
          requests.push(
            //Get container details
            this.manageImportsExportsService.requestContainersService
              .getTransactionById(this.requestDetails.requestContainer?.id)
              .pipe(
                tap((res) => {
                  this.requestContainerDetails = res;
                }),
                catchError((error) => {
                  console.error('Request 1 failed:', error);
                  return of(null); // Return a default value or handle the error as needed
                })
              )
          );
        }

        if (this.requestDetails.hasExportRecommendation) {
          requests.push(
            //Get سكشن دراسة مقترح
            this.manageImportsExportsService.requestsService
              .getExportRecommendation(this.requestDetails.id)
              .pipe(
                tap((res) => {
                  this.requestExportRecommendation = res;
                }),
                catchError((error) => {
                  console.error('Request 4 failed:', error);
                  return of(null);
                })
              )
          );
        }

        if (this.requestDetails.isCommitteeApprovalStep) {
          requests.push(
            //Get list of committee members approvals
            this.manageImportsExportsService.requestsService
              .getCommitteeApprovals(this.requestDetails.id)
              .pipe(
                tap((res) => {
                  this.committeeMembersApprovals = res;
                  this.initRealTime();
                }),
                catchError((error) => {
                  console.error('Request 5 failed:', error);
                  return of(null); // Return a default value or handle the error as needed
                })
              )
          );
        }

        if (requests.length) {
          forkJoin(requests).subscribe({
            next: (res) => {
              this.isLoading = false;
            },
            error: (err) => {
              this.isLoading = false;
              if (err.status === 403 || err.status === 404) {
                this.router.navigate(['../../'], {
                  relativeTo: this.activatedRoute,
                });
              }
            },
            complete: () => {
              /* 
                '------------------------- ALL COMPLETED -----------------------------'
              ); */
            },
          });
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 403 || err.status === 404) {
          this.router.navigate(['../../'], {
            relativeTo: this.activatedRoute,
          });
        }
      },
    });
  }

  updateAssignedUser(): void {
    this.manageImportsExportsService.requestsService.updateAssignedUser(this.elementId).subscribe({
      next: () => {
        this.toastr.success(
          this.translateService.instant(
            'ImportsExportsModule.RequestDetailsComponent.transationSuccess'
          )
        );

        // this.initializePageData();
      },
      error: (err) => {
        this.toastr.error('Failed to update user');
      },
    });
  }

  deleteAssignedUser(): void {
    this.manageImportsExportsService.requestsService.deleteAssignedUser(this.elementId).subscribe({
      next: () => {
        this.toastr.success(
          this.translateService.instant(
            'ImportsExportsModule.RequestDetailsComponent.transationError'
          )
        );
      },
      error: (err) => {
        this.toastr.error('Failed to update user');
      },
    });
  }

  onAddImport(): void {
    this.router.navigate(['..', 'imports-exports', this.elementId, 'import']);
  }

  onNavigateBack(): void {
    this.location.back();
  }
  private linkDialogRef: MatDialogRef<LinkTransactionComponent> | null = null;
  clicked: boolean = false;
  onLinkTransaction(event: MouseEvent): void {
    if (this.linkDialogRef) {
      return;
    }

    this.clicked = true;
    const svgRect = (event.target as HTMLElement).getBoundingClientRect();
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const dialogWidth = 34.875 * rem;

    let top = svgRect.bottom + window.scrollY + 12;
    let left = svgRect.left + 40 + window.scrollX + svgRect.width / 2 - dialogWidth / 2;

    this.linkDialogRef = this.dialog.open(LinkTransactionComponent, {
      width: '30rem',
      hasBackdrop: true,
      position: {
        top: `${top}px`,
        left: `${left}px`,
      },
      panelClass: 'filters-dialog-panel',
      data: {
        requestId: this.elementId,
        title: this.requestContainerDetails.title,
        transactionNo: this.requestContainerDetails.transactionNumber,
        year: this.requestContainerDetails.year,
      },
    });

    this.linkDialogRef.afterClosed().subscribe((dialogResult) => {
      // Reset the dialog reference to null after closing
      this.linkDialogRef = null;
      this.clicked = false;
      this.activeIconIndex = null;

      if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
        this.initializePageData();
      }
    });
  }

  onChangeUrlOfRequestId(requestId: string): void {
    this.router.navigateByUrl(this.router.url.replace(this.elementId, requestId));
  }

  onSelectAction(action: Action) {
    if (this.selectedActionId === action.id) {
      // Toggle: if already selected, deselect
      this.selectedActionId = null;
      this.selectedAction = null;
    } else {
      // Select new action
      this.selectedActionId = action.id;
      this.selectedAction = action;
      this.selectedForDelete = false;
    }
  }
  onActionClicked(action: Action): void {
    if (this.selectedForDelete) {
      this.deleteItem();
      return;
    }
    if (
      action.actionType === ActionType.Approve ||
      action.actionType === ActionType.RedirectingRequest ||
      action.actionType === ActionType.ChangeRequest
    ) {
      const dialogRef = this.dialog.open(AcceptanceActionModalComponent, {
        autoFocus: false,
        minWidth: '31.25rem',
        maxWidth: '31.25rem',
        maxHeight: '44.3125rem',
        panelClass: 'action-modal',
        disableClose: true,
        data: {
          header: action.title,
          textAreaLabel: this.translateService.instant('shared.note'),
          buttonLabel: this.translateService.instant('shared.confirm'),
        },
      });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
          this.executeRequestAction(action.id, action.actionType, dialogResult.data);
        }
      });
      return;
    }

    if (action.actionType === ActionType.Delegate) {
      const dialogRef = this.dialog.open(DelegateUserModalComponent, {
        autoFocus: false,
        minWidth: '31.25rem',
        maxWidth: '31.25rem',
        maxHeight: '44.3125rem',
        panelClass: 'action-modal',
        disableClose: true,
        data: {
          header: action.title,
          textAreaLabel: this.translateService.instant('shared.note'),
          buttonLabel: this.translateService.instant('shared.confirm'),
        },
      });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
          this.executeRequestAction(action.id, action.actionType, dialogResult.data);
        }
      });
      return;
    }

    if (action.actionType === ActionType.SelectConsultants) {
      const dialogRef = this.dialog.open(ConsultantsAssignmentModalComponent, {
        minWidth: '31.25rem',
        maxWidth: '31.25rem',
        maxHeight: '44.3125rem',
        panelClass: 'action-modal',
        autoFocus: false,
        disableClose: false,
      });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
          this.executeRequestAction(action.id, action.actionType, dialogResult.data);
        }
      });
      return;
    }

    if (action.actionType === ActionType.SelectRecommendationType) {
      const dialogRef = this.dialog.open(SelectRecommendationTypeModalComponent, {
        autoFocus: false,
        minWidth: '31.25rem',
        maxWidth: '31.25rem',
        maxHeight: '44.3125rem',
        panelClass: 'action-modal',
        disableClose: true,
        data: {
          header: action.title,
          buttonLabel: this.translateService.instant('shared.confirm'),
        },
      });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
          this.executeRequestAction(action.id, action.actionType, dialogResult.data);
        }
      });
      return;
    }

    if (action.actionType === ActionType.SelectBenefitType) {
      const dialogRef = this.dialog.open(SelectBenefitTypeModalComponent, {
        autoFocus: false,
        minWidth: '31.25rem',
        maxWidth: '31.25rem',
        maxHeight: '44.3125rem',
        panelClass: 'action-modal',
        disableClose: true,
        data: {
          header: action.title,
          buttonLabel: this.translateService.instant('shared.confirm'),
        },
      });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
          this.executeRequestAction(action.id, action.actionType, dialogResult.data);
        }
      });
      return;
    }

    if (action.actionType === ActionType.InternalAssignment) {
      const dialogRef = this.dialog.open(InternalAssignmentUserModalComponent, {
        autoFocus: false,
        minWidth: '31.25rem',
        maxWidth: '31.25rem',
        maxHeight: '44.3125rem',
        panelClass: 'action-modal',
        disableClose: true,
        data: {
          header: action.title,
          textAreaLabel: this.translateService.instant('shared.note'),
          buttonLabel: this.translateService.instant('shared.confirm'),
        },
      });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
          this.executeRequestAction(action.id, action.actionType, dialogResult.data);
        }
      });
      return;
    }

    if (action.actionType === ActionType.SelectProcessType) {
      const dialogRef = this.dialog.open(SelectProcessTypeModalComponent, {
        autoFocus: false,
        minWidth: '31.25rem',
        maxWidth: '31.25rem',
        maxHeight: '44.3125rem',
        panelClass: 'action-modal',
        disableClose: true,
        data: {
          header: action.title,
          buttonLabel: this.translateService.instant('shared.confirm'),
        },
      });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
          this.executeRequestAction(action.id, action.actionType, dialogResult.data);
        }
      });
      return;
    }

    if (action.actionType === ActionType.Scheduling) {
      const dialogRef = this.dialog.open(RescheduleMeetingComponent, {
        autoFocus: false,
        minWidth: '26.5rem',
        maxWidth: '26.5rem',
        maxHeight: '14rem',
        panelClass: 'action-modal',
        disableClose: true,
        data: {
          title: this.translateService.instant('dialogs.rescheduleMeeting.title'),
          desc: this.translateService.instant('dialogs.rescheduleMeeting.description'),
        },
      });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult.statusCode === ModalStatusCode.Success) {
          this.executeRequestAction(action.id, action.actionType, undefined, false, () => {
            // Show confirmation div after API call succeeds
            this.showRescheduleConfirmation = true;

            // Hide confirmation after 1 second
            setTimeout(() => {
              this.showRescheduleConfirmation = false;
            }, 1000);
          });
        }
      });
      return;
    }

    if (
      action.actionType === ActionType.Reject ||
      action.actionType === ActionType.Archiving ||
      action.actionType === ActionType.Close
    ) {
      const dialogRef = this.dialog.open(CommentModalComponent, {
        autoFocus: false,
        minWidth: '31.25rem',
        maxWidth: '31.25rem',
        maxHeight: '44.3125rem',
        panelClass: 'action-modal',
        disableClose: true,
        data: {
          header: action.title,
          actionType: action.actionType,
          buttonLabel: this.translateService.instant('shared.confirm'),
          textAreaLabel: this.translateService.instant('shared.note'),
        },
      });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
          this.executeRequestAction(action.id, action.actionType, dialogResult.data);
        }
      });
      return;
    }

    if (
      action.actionType === ActionType.ExportTypeRecommendation ||
      action.actionType === ActionType.RecordProducing ||
      action.actionType === ActionType.LetterProducing ||
      action.actionType === ActionType.NoteProducing
    ) {
      let exportType = null;

      if (this.requestExportRecommendation) {
        exportType = this.requestExportRecommendation.exportType;
      }

      if (action.actionType === ActionType.RecordProducing) {
        exportType = ExportedDocumentType.Record;
      }

      if (action.actionType === ActionType.LetterProducing) {
        exportType = ExportedDocumentType.Letter;
      }

      if (action.actionType === ActionType.NoteProducing) {
        exportType = ExportedDocumentType.Note;
      }

      const dialogRef = this.dialog.open(StudyProjectModalComponent, {
        minWidth: '62.5rem',
        maxWidth: '62.5rem',
        maxHeight: '95vh',
        height: '95vh',
        panelClass: ['action-modal', 'float-footer'],
        disableClose: true,
        autoFocus: false,
        data: {
          header: action.title,
          buttonLabel: this.translateService.instant('shared.confirm'),
          requestId: this.requestDetails.id,
          requestAutoNumber: this.requestDetails.autoNumber,
          requestTitle: this.requestDetails.title,
          actionId: action.id,
          actionType: action.actionType,
          formFields: {
            committeeId: this.requestDetails.committee?.id,
            exportType,
            requestExportRecommendation: this.requestExportRecommendation,
            creditsRequestedAmount: this.requestDetails.creditsRequestedAmount,
            creditsApprovedAmount: this.requestDetails.creditsApprovedAmount,
            costsRequestedAmount: this.requestDetails.costsRequestedAmount,
            costsApprovedAmount: this.requestDetails.costsApprovedAmount,
          },
          editorFileId: this.requestDetails.editorFileId,
        },
      });
      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
          this.executeRequestAction(action.id, action.actionType, dialogResult.data);
        }
      });
      return;
    }

    if (action.actionType === ActionType.RequestStatement) {
      const dialogRef = this.dialog.open(StatementRequestModalComponent, {
        autoFocus: false,
        minWidth: '31.25rem',
        maxWidth: '31.25rem',
        maxHeight: '44.3125rem',
        panelClass: 'action-modal',
        disableClose: true,
        data: {
          header: action.title,
          buttonLabel: this.translateService.instant('shared.save'),
          requestId: this.requestDetails.id,
          requestAutoNumber: this.requestDetails.autoNumber,
          actionId: action.id,
          editorFileId: this.requestDetails.id,
        },
      });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
          this.executeRequestAction(action.id, action.actionType, dialogResult.data);
        }
      });
      return;
    }

    /*   if (action.actionType === ActionType.ExportRequestStatement) {
      const dialogRef = this.dialog.open(ExportRequestStatementModalComponent, {
        minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '800px',
        maxWidth: '95vw',
        autoFocus: false,
        disableClose: true,
        data: {
          header: action.title,
          requestId: this.requestDetails.id,
          actionId: action.id,
        },
      });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (
          dialogResult &&
          dialogResult.statusCode === ModalStatusCode.Success
        ) {
          this.executeRequestAction(action.id, action.actionType);
        }
      });
      return;
    } */

    if (action.actionType === ActionType.SignatureFormat) {
      if (!this.requestDetails.committee) {
        this.toastr.error(
          this.translateService.instant(
            'ImportsExportsModule.RequestDetailsComponent.noChosenCommittee'
          )
        );
        return;
      }

      let committeeId = '';
      if (this.requestDetails.committee) {
        committeeId = this.requestDetails.committee.id;
      }

      const dialogRef = this.dialog.open(SignatureFormatModalComponent, {
        minWidth: '62.5rem',
        maxWidth: '62.5rem',
        maxHeight: '95vh',
        height: '95vh',
        panelClass: ['action-modal', 'float-footer'],
        disableClose: true,
        data: {
          header: action.title,
          requestId: this.requestDetails.id,
          actionId: action.id,
          committeeId,
        },
      });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
          this.executeRequestAction(action.id, action.actionType, dialogResult.data);
        }
      });
      return;
    }

    if (action.actionType === ActionType.UploadForSignatures) {
      const dialogRef = this.dialog.open(RescheduleMeetingComponent, {
        autoFocus: false,
        minWidth: '26.5rem',
        maxWidth: '26.5rem',
        maxHeight: '14rem',
        panelClass: 'action-modal',
        disableClose: true,
        data: {
          title: this.translateService.instant('dialogs.resignMeeting.title'),
          desc: this.translateService.instant('dialogs.resignMeeting.description'),
        },
      });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult.statusCode === ModalStatusCode.Success) {
          this.executeRequestAction(action.id, action.actionType, undefined, false, () => {
            // Show confirmation div after API call succeeds
            this.showResignConfirmation = true;

            // Hide confirmation after 1 second
            setTimeout(() => {
              this.showResignConfirmation = false;
            }, 1000);
          });
        }
      });
      return;
    }

    if (action.actionType === ActionType.Initiate) {
      const dialogRef = this.dialog.open(InitiateModalComponent, {
        minWidth: '62.5rem',
        maxWidth: '62.5rem',
        maxHeight: '95vh',
        height: '95vh',
        panelClass: ['action-modal', 'float-footer'],
        disableClose: true,
        data: {
          header: action.title,
          requestId: this.requestDetails.id,
          actionId: action.id,
          requestAutoNumber: this.requestDetails.autoNumber,
          fileName: this.requestDetails.currentExport?.name,
          currentProgress: this.requestDetails.currentProgress,
          currentExport: this.requestDetails.currentExport,
        },
      });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
          this.executeRequestAction(action.id, action.actionType);
        }
      });
      return;
    }

    if (action.actionType === ActionType.SummarizeExportDocument) {
      const dialogRef = this.dialog.open(SummarizeExportDocumentModalComponent, {
        minWidth: '62.5rem',
        maxWidth: '62.5rem',
        maxHeight: '95vh',
        height: '95vh',
        panelClass: ['action-modal', 'float-footer'],
        disableClose: true,
        data: {
          header: action.title,
          requestId: this.requestDetails.id,
          actionId: action.id,
          editorFileId: this.requestDetails.editorFileId,
        },
      });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
          this.executeRequestAction(action.id, action.actionType, dialogResult.data);
        }
      });
      return;
    }

    if (action.actionType === ActionType.ExportTemplate) {
      const dialogRef = this.dialog.open(ExportTemplateModalComponent, {
        minWidth: '62.5rem',
        maxWidth: '62.5rem',
        maxHeight: '95vh',
        height: '95vh',
        panelClass: ['action-modal', 'float-footer'],
        disableClose: true,
        data: {
          header: action.title,
          requestId: this.requestDetails.id,
          actionId: action.id,
          studyingFile: this.requestDetails.studyingFile,
          requestAutoNumber: this.requestDetails.autoNumber,
          currentExport: this.requestDetails.currentExport,
          currentProgress: this.requestDetails.currentProgress,
        },
      });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
          this.executeRequestAction(action.id, action.actionType, dialogResult.data);
        }
      });
      return;
    }

    if (
      action.actionType === ActionType.LegalAuditing ||
      action.actionType === ActionType.Proofreading
    ) {
      if (!this.requestDetails.studyingFile) {
        this.toastr.error('لايوجد مقترح دراسة أو طلب إفادة');
        return;
      }

      const dialogRef = this.dialog.open(AuditingModalComponent, {
        minWidth: '62.5rem',
        maxWidth: '62.5rem',
        maxHeight: '95vh',
        height: '95vh',
        panelClass: ['action-modal', 'float-footer'],
        disableClose: true,
        data: {
          header: action.title,
          requestId: this.requestDetails.id,
          actionId: action.id,
          studyingFile: this.requestDetails.studyingFile,
          requestAutoNumber: this.requestDetails.autoNumber,
          actionType: action.actionType,
          editorFileId: this.requestDetails.editorFileId,
          currentProgress: this.requestDetails.currentProgress,
        },
      });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
          this.executeRequestAction(action.id, action.actionType, dialogResult.data);
        }
      });
      return;
    }

    if (action.actionType === ActionType.Export) {
      if (
        !this.requestDetails.currentExport ||
        !this.requestDetails.currentExport.name.endsWith('.pdf')
      ) {
        this.toastr.error('عفوا يجب تنسيق الملف اولا');

        return;
      }
      const dialogRef = this.dialog.open(ExportModalComponent, {
        minWidth: '62.5rem',
        maxWidth: '62.5rem',
        maxHeight: '95vh',
        height: '95vh',
        panelClass: ['action-modal', 'float-footer'],
        disableClose: true,
        data: {
          header: action.title,
          requestId: this.requestDetails.id,
          actionId: action.id,
          requestAutoNumber: this.requestDetails.autoNumber,
          currentExport: this.requestDetails.currentExport,
          currentProgress: this.requestDetails.currentProgress,
          foundations: this.requestDetails.currentExport!.foundations,
        },
      });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
          this.executeRequestAction(action.id, action.actionType, dialogResult.data);
        }
      });
      return;
    }

    if (action.actionType === ActionType.Signature) {
      this.toastr.warning(
        this.translateService.instant(
          'ImportsExportsModule.RequestDetailsComponent.signatureViaTablet'
        )
      );
      return;
    }

    if (action.actionType === ActionType.ReUploadDocument) {
      const dialogRef = this.dialog.open(ReUploadDocumentModalComponent, {
        autoFocus: false,
        minWidth: '31.25rem',
        maxWidth: '31.25rem',
        maxHeight: '44.3125rem',
        panelClass: 'action-modal',
        disableClose: true,
        data: {
          header: action.title,
          requestId: this.requestDetails.id,
          actionId: action.id,
          buttonLabel: this.translateService.instant('shared.save'),
        },
      });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
          this.executeRequestAction(action.id, action.actionType, dialogResult.data);
        }
      });
      return;
    }

    if (action.actionType === ActionType.UploadCommitteeApprovalDocument) {
      const dialogRef = this.dialog.open(UploadCommitteeApprovalFileModalComponent, {
        autoFocus: false,
        minWidth: '31.25rem',
        maxWidth: '31.25rem',
        maxHeight: '44.3125rem',
        panelClass: 'action-modal',
        disableClose: true,
        data: {
          header: action.title,
          requestId: this.requestDetails.id,
          actionId: action.id,
          buttonLabel: this.translateService.instant('shared.save'),
        },
      });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
          this.executeRequestAction(action.id, action.actionType, dialogResult.data);
        }
      });
      return;
    }

    /////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////
  }

  onResetRequest(): void {
    const dialogRef = this.dialog.open(ResetRequestModalComponent, {
      minWidth: '62.5rem',
      maxWidth: '62.5rem',
      maxHeight: '95vh',
      height: '95vh',
      panelClass: ['action-modal', 'float-footer'],
      autoFocus: false,
      disableClose: true,
      data: {
        requestId: this.elementId,
      },
    });

    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
        this.displayProgressSpinner = true;

        if (dialogResult.data.type === 'reset') {
          this.manageImportsExportsService.requestsService
            .resetRequest(this.elementId, dialogResult.data.selectedStepId)
            .subscribe({
              next: (res) => {
                this.displayProgressSpinner = false;
                this.initializePageData();
              },
              error: (err) => {
                this.displayProgressSpinner = false;
              },
            });
          return;
        }

        if (dialogResult.data.type === 'cancelAllSteps') {
          this.manageImportsExportsService.requestsService
            .resetRequest(this.elementId, null)
            .subscribe({
              next: (res) => {
                this.displayProgressSpinner = false;
                this.initializePageData();
              },
              error: (err) => {
                this.displayProgressSpinner = false;
              },
            });
        }
      }
    });
  }

  private executeRequestAction(
    actionId: string,
    actionType: ActionType,
    data?: any,
    showToastr: boolean = true,
    onComplete?: () => void
  ) {
    this.displayProgressSpinner = true;
    this.manageImportsExportsService.requestsService
      .executeRequestAction(this.requestDetails.id, actionId, actionType, data)
      .subscribe({
        next: (res) => {
          this.displayProgressSpinner = false;

          if (showToastr) {
            this.toastr.success(
              this.translateService.instant(
                'ImportsExportsModule.RequestDetailsComponent.doneSuccessfully'
              )
            );
          }

          // Reset selected action and selection state
          this.selectedActionId = null;
          this.selectedAction = null;
          this.selectedForDelete = false;

          // Reload page data to get updated actions
          this.initializePageData();

          if (onComplete) {
            onComplete();
          }
        },
        error: (err) => {
          this.displayProgressSpinner = false;

          this.toastr.error(
            this.translateService.instant(
              'ImportsExportsModule.RequestDetailsComponent.actionFailed'
            )
          );
        },
      });
  }

  onPrintBarcode(withTemplate: boolean = true): void {
    if (withTemplate) {
      this.manageImportsExportsService.requestsService
        .getBarcode(this.elementId, withTemplate)
        .subscribe((res) => {
          printJS({
            printable: window.URL.createObjectURL(
              new File([base64ToArrayBuffer(res)], 'import-barcode.png')
            ),
            type: 'image',
            base64: false,
            documentTitle: 'import-barcode.png',
          });
        });
      return;
    }
    ////////////////////////////with out template////////////////////////////////
    this.manageImportsExportsService.requestsService
      .getBarcodeDetails(this.elementId)
      .subscribe((res) => {
        const tempHijriDateArr = convertEnglishToArabicNumbers(res.hijriDate)
          .replaceAll('/', '-')
          .split('-');

        const hijriDate = `${tempHijriDateArr[2]}-${tempHijriDateArr[1]}-${tempHijriDateArr[0]}`;
        ///////////////

        const tempGregorianDateArr = convertEnglishToArabicNumbers(
          formatDateToYYYYMMDD(new Date(res.date))
        ).split('-');
        const gregorianDate = `${tempGregorianDateArr[2]}-${tempGregorianDateArr[1]}-${tempGregorianDateArr[0]}`;

        const htmlToBePrinted = getBarcodeWithOUTBackground(
          `${convertEnglishToArabicNumbers(padToFourDigits(res.autoNumber))} - ${res.priority}`,
          //'٠٠٧٨ - فورا',
          hijriDate,

          // '١٤٤٦/٦/٢٢',
          gregorianDate,
          // '٢٠٢٤/١٢/٢٦',
          convertEnglishToArabicNumbers(res.attachmentDescription?.trim()?.replace(/"/g, '')),
          // 'وارد'
          res.base64Barcode
        );

        printJS({
          printable: htmlToBePrinted,
          type: 'raw-html',
          base64: false,
          documentTitle: 'import-barcode.png',
        });
      });
  }

  formatConcernedFoundations(
    concernedFoundations: { id: string; title: string; titleEn: string }[]
  ): string {
    return concernedFoundations
      .map((ele) => {
        return this.lang === 'ar' ? ele.title : ele.titleEn;
      })
      .join(' ,');
  }

  getTimelineData() {
    this.tabsLoading.tab1 = true;
    this.manageImportsExportsService.requestsService
      .getRequestActions(this.elementId, this.sortAsc)
      .pipe(
        map((res) => {
          this.tabsLoading.tab1 = false;
          this.requestActions = res;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
    return;
  }

  attachmentSearchControl = new FormControl('');
  searchNameValue = '';
  searchName(e: any) {
    this.searchNameValue = e;
    this.getAttachments(this.searchNameValue);
  }
  getAttachments(searchKeyword?: string) {
    this.manageImportsExportsService.requestsService
      .getRequestAttachments(this.elementId, { searchKeyword })
      .pipe(
        tap((res) => {
          this.tabsLoading.tab3 = false;
          this.items = res.map((attachment: any) => ({
            ...attachment,
            length: this.formatFileSize(attachment.length), // Format file size with KB
          }));
          this.cdr.markForCheck(); // Trigger change detection
        }),
        catchError((error) => {
          console.error('[Tab 3] Failed to fetch attachments:', error);
          this.tabsLoading.tab3 = false;
          this.items = []; // Reset to empty array on error
          this.cdr.markForCheck(); // Trigger change detection
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef) // Cleanup subscription on component destroy
      )
      .subscribe();
  }
  private formatFileSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 KB';

    const kb = bytes / 1024;

    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    } else {
      const mb = kb / 1024;
      return `${mb.toFixed(1)} MB`;
    }
  }
  private getFormattedRequestType(element: any): string {
    if (element.isExportDocument) {
      switch (element.documentType) {
        case ExportedDocumentType.Letter:
          return this.translateService.instant('TransactionsModule.ExportDocumentComponent.letter');
        case ExportedDocumentType.Note:
          return this.translateService.instant('TransactionsModule.ExportDocumentComponent.note');
        case ExportedDocumentType.Record:
          return this.translateService.instant('TransactionsModule.ExportDocumentComponent.record');
        case ExportedDocumentType.Other:
          return element.otherDocumentType?.title || '';
        default:
          return '';
      }
    } else {
      return element.requestType?.title || '';
    }
  }
  onTabClicked(event: MatTabChangeEvent): void {
    if (event.index === 0) {
      return;
    }
    if (event.index === 3) {
      this.tabsLoading.tab3 = true; // Set to true while loading
      this.getAttachments();
      return;
    }

    if (event.index === 1) {
      this.tabsLoading.tab1 = true;
      this.isLoadingImport = true;
      this.isErrorImport = false;

      this.manageImportsExportsService.requestsService
        .getRequestImportsAndExports(this.elementId, {
          pageSize: 1000,
          pageIndex: 0,
        })
        .pipe(
          tap((res) => {
            this.tabsLoading.tab1 = false;
            this.isLoadingImport = false;
            this.importsExports = res.data;
          }),
          catchError((error) => {
            console.error('Request 2 failed:', error);
            this.tabsLoading.tab1 = false;
            this.isLoadingImport = false;
            this.isErrorImport = true;
            return of(null); // Return a default value or handle the error as needed
          })
        )
        .subscribe();

      return;
    }

    if (event.index === 2) {
      this.tabsLoading.tab2 = true;

      // OLD APPROACH: Made two sequential API calls (getRelatedRequestsList -> getRelatedTransactions)
      // This was inefficient as only relatedRequests data was being used
      // Commented out to prevent duplicate API calls
      /* 
      this.manageImportsExportsService.requestsService
        .getRelatedRequestsList(
          {
            pageSize: 1000,
            pageIndex: 0,
          },
          {
            requestId: this.elementId,
          }
        )
        .pipe(
          switchMap((res) => {
            return this.manageImportsExportsService.requestsService.getRelatedTransactions(
              this.elementId
            );
          }),
          tap((res) => {
            this.relatedRequests = res;
            this.tabsLoading.tab2 = false;
          }),
          catchError((error) => {
            console.error('Request failed:', error);
            this.tabsLoading.tab2 = false;
            return of(null);
          })
        )
        .subscribe();
      */

      // ENHANCED APPROACH: Single optimized API call
      // Directly fetches related transactions without unnecessary preliminary call
      // Reduces network overhead and improves page responsiveness
      this.manageImportsExportsService.requestsService
        .getRelatedTransactions(this.elementId)
        .pipe(
          tap((res) => {
            this.relatedRequests = res.data || [];
            this.tabsLoading.tab2 = false;
          }),
          catchError((error) => {
            this.tabsLoading.tab2 = false;
            this.relatedRequests = []; // Reset to empty array on error
            return of(null);
          })
        )
        .subscribe();
    }
  }

  //Committee members approvals
  onViewComment(comment: string): void {
    this.dialog.open(ViewNoteModalComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '800px',
      maxWidth: '95vw',
      autoFocus: false,
      disableClose: true,
      data: {
        comment,
      },
    });
  }

  onCopyNote(comment: string): void {
    this.clipboard.copy(comment);
    this.toastr.success('Note copied successfully');
  }

  onTakeActionViaPhone(committeeApproval: CommitteeApproval): void {
    this.dialog.open(TakeCommitteeMemberApprovalActionComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '800px',
      maxWidth: '95vw',
      autoFocus: false,
      disableClose: true,
      data: {
        requestId: this.requestDetails.id,
        committeeApproval: committeeApproval,
      },
    });
  }

  initRealTime(): void {
    this.manageImportsExportsService.notificationsHubService.registerMethod(
      'RequestApprovalReceiver',
      (data: CommitteeApprovalRealTime) => {
        console.info('data received:', data);
        if (this.requestDetails.id === data.requestId) {
          //- Update only specified member
          const foundMember = this.committeeMembersApprovals.find(
            (ele) => ele.id === data.memberId
          );

          if (foundMember) {
            foundMember.action = {
              comment: data.comment || '',
              approval: data.approval,
              date: data.date,
            };
            this.sortMembers(this.committeeMembersApprovals);
            this.cdr.detectChanges();
          }
        }
      }
    );
  }
  initRealTimeToGetRequestAssigningReceiver(): void {
    this.manageImportsExportsService.notificationsHubService.registerMethod(
      'RequestAssigningReceiver',
      (data: RequestAssigningReceiverRealTime) => {
        console.info('data received:', data);
        if (this.requestDetails.id === data.requestId) {
          this.requestDetails.assignedUser = data.user;
          //- Update only specified member
          // const foundMember = this.committeeMembersApprovals.find(
          //   (ele) => ele.id === data.memberId
          // );
          //
          // if (foundMember) {
          //   foundMember.action = {
          //     comment: data.comment || '',
          //     approval: data.approval,
          //     date: data.date,
          //   };
          //   this.sortMembers(this.committeeMembersApprovals);
          //   this.cdr.detectChanges();
          // }
        }
      }
    );
  }
  private sortMembers(members: CommitteeApproval[]) {
    members.sort(function (a, b) {
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      if (!a.action) {
        return 1; //[b,a]
      }

      if (!b.action) {
        return -1; //[a,b]
      }

      if (new Date(a.action.date) <= new Date(b.action.date)) {
        return -1; //[a,b]
      }
      return 1; //[b,a]
    });
  }

  onToggleSort() {
    this.sortAsc = !this.sortAsc;
    this.getTimelineData();
    // this.requestActions = [...this.requestActions].sort((a, b) => {
    //   const dateA = new Date(a.date).getTime();
    //   const dateB = new Date(b.date).getTime();
    //   return this.sortAsc ? dateA - dateB : dateB - dateA;
    // });
  }
}

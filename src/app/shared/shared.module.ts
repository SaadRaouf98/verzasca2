import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MaterialsModule } from './materials/materials.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';
import { SharedMembersComponent } from './components/shared-members/shared-members.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { TitleDescriptionTableComponent } from './components/title-description-table/title-description-table.component';
import { TitleDescriptionFormComponent } from './components/title-description-form/title-description-form.component';
import { SummaryPipe } from './pipes/summary.pipe';
import { HijriDateRangeComponent } from './components/hijri-date-range/hijri-date-range.component';
import { AcceptanceActionModalComponent } from './components/acceptance-action-modal/acceptance-action-modal.component';
import { ConsultantsAssignmentModalComponent } from './components/consultants-assignment-modal/consultants-assignment-modal.component';
import { HijriDateComponent } from './components/hijri-date/hijri-date.component';
import { ImportsExportsScrollableTableComponent } from './components/imports-exports-scrollable-table/imports-exports-scrollable-table.component';
import { RelatedRequestsScrollableTableComponent } from './components/related-requests-scrollable-table/related-requests-scrollable-table.component';
import { TransactionTimelineScrollableTableComponent } from './components/transaction-timeline-scrollable-table/transaction-timeline-scrollable-table.component';
import { DropzoneComponent } from './components/dropzone/dropzone.component';
import { ViewImageModalComponent } from './components/view-image-modal/view-image-modal.component';
import { SimplePdfModalComponent } from './components/simple-pdf-modal/simple-pdf-modal.component';
import { SuccessModalComponent } from './components/success-modal/success-modal.component';
import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';
import { NgxPermissionsModule } from 'ngx-permissions';
import { DelegateUserModalComponent } from './components/delegate-user-modal/delegate-user-modal.component';
import { SelectRecommendationTypeModalComponent } from './components/select-recommendation-type-modal/select-recommendation-type-modal.component';
import { SelectBenefitTypeModalComponent } from './components/select-benefit-type-modal/select-benefit-type-modal.component';
import { SelectProcessTypeModalComponent } from './components/select-process-type-modal/select-process-type-modal.component';
import { CommentModalComponent } from './components/comment-modal/comment-modal.component';
import { DocumentEditorModule } from '@txtextcontrol/tx-ng-document-editor';
import { TimeLineComponent } from './components/time-line/time-line.component';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { StudyProjectModalComponent } from './components/study-project-modal/study-project-modal.component';
import { StatementRequestModalComponent } from './components/statement-request-modal/statement-request-modal.component';
import { ProposedStudyDetailsComponent } from './components/proposed-study-details/proposed-study-details.component';
import { SignatureFormatModalComponent } from './components/signature-format-modal/signature-format-modal.component';
import { KtdGridModule } from '@katoid/angular-grid-layout';
import { InitiateModalComponent } from './components/initiate-modal/initiate-modal.component';
import { SummarizeExportDocumentModalComponent } from './components/summarize-export-document-modal/summarize-export-document-modal.component';
import { ExportTemplateModalComponent } from './components/export-template-modal/export-template-modal.component';
import { ExportModalComponent } from './components/export-modal/export-modal.component';
import { AuditingModalComponent } from './components/auditing-modal/auditing-modal.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { SignaturePlaceHolderComponent } from './components/signature-place-holder/signature-place-holder.component';
import { AngularDraggableModule } from 'angular2-draggable';
import { InitiatePlaceHolderComponent } from './components/initiate-place-holder/initiate-place-holder.component';
import { ViewAttachmentsModalComponent } from './components/view-attachments-modal/view-attachments-modal.component';
import { BarcodePlaceHolderComponent } from './components/barcode-place-holder/barcode-place-holder.component';
import { InternalAssignmentUserModalComponent } from './components/internal-assignment-user-modal/internal-assignment-user-modal.component';
import { ReUploadDocumentModalComponent } from './components/re-upload-record-modal/re-upload-document-modal.component';
import { TablePaginatorComponent } from './components/table-paginator/table-paginator.component';
import { EditorComponent } from './components/editor/editor.component';
import { UserSearchComponent } from './components/user-search/user-search.component';
import { CurrencyFormatterDirective } from './directives/currency-formatter.directive';
import { NewHijriCalendarComponent } from './components/new-hijri-calendar/new-hijri-calendar.component';
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MY_FORMATS } from '@core/utils/date-picker-format';
import { TransactionNumberPipe } from './pipes/transaction-number.pipe';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
import { InputSanitizerDirective } from './directives/input-sanitizer.directive';
import { NormalPagePlaceholderComponent } from './components/normal-page-placeholder/normal-page-placeholder.component';
import { GlobalProgressSpinnerComponent } from './components/global-progress-spinner/global-progress-spinner.component';
import { ViewFileModalComponent } from './components/view-file-modal/view-file-modal.component';
import { SingleGregorianCalendarComponent } from '@shared/components/calendar/single-gregorian-calendar/single-gregorian-calendar.component';
import { SingleHijriCalendarComponent } from '@shared/components/calendar/single-hijri-calendar/single-hijri-calendar.component';
import { FoundationSearchComponent } from './components/foundation-search/foundation-search.component';
import { SubFoundationSearchComponent } from './components/sub-foundation-search/sub-foundation-search.component';
import { MultiProgressBarComponent } from './components/multi-progress-bar/multi-progress-bar.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MinutesToReadableTimePipe } from '@shared/pipes/minutesToReadableTime.pipe';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { PageFilterComponent } from '@shared/components/page-filter/page-filter.component';
import { RangeGregorianCalendarComponent } from '@shared/components/calendar/range-gregorian-calendar/range-gregorian-calendar.component';
import { InputComponent } from '@shared/components/input/input.component';
import { TabsComponent } from '@shared/components/tabs/tabs.component';
import { TabComponent } from '@shared/components/tabs/tab.component';
import { TableComponent } from '@shared/components/table/table.component';
import { PdfViewerComponent } from '@shared/components/pdf-viewer/pdf-viewer.component';
import { UploadAttachmentComponent } from '@shared/components/upload-attachment/upload-attachment.component';
import { FormComponent } from '@shared/components/form/form.component';
import { DatePickerRangeComponent } from '@shared/components/date-picker-range/date-picker-range.component';
import { DatePickerComponent } from '@shared/components/date-picker/date-picker.component';
import { ShowWhenNoDataDirective } from '@shared/directives/show-when-no-data.directive';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { InlineCalendarComponent } from '@shared/components/inline-calendar/inline-calendar.component';
import { NgbDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { SlideToggleComponent } from '@shared/components/sidenav-toggle/sidenav-toggle.component';
import { SingleSelectComponent } from './components/single-select/single-select.component';
import { UploadCommitteeApprovalFileModalComponent } from './components/upload-committee-approval-file-modal/upload-committee-approval-file-modal.component';
import { PriorityColorPipe } from './pipes/priorityColor.pipe';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { TableListComponent } from '@shared/new-components/table-list/table-list.component';
import { BaseDialogComponent } from '@shared/base-components/base-dialog/base-dialog.component';
import { DatePickerHijriComponent } from './components/date-picker-hijri/date-picker-hijri.component';
import { AuthorizationContainerComponent } from '@shared/new-components/authorization-container/authorization-container.component';

const externalModules = [
  CommonModule,
  MaterialsModule,
  RouterModule,
  FormsModule,
  ReactiveFormsModule,
  TranslateModule,
  NgSelectModule,
  DocumentEditorModule,
  NgxPermissionsModule.forChild(),
  NgxDocViewerModule,
  NgApexchartsModule,
];

const COMPONENTS: any[] = [
  ConfirmationModalComponent,
  ProgressBarComponent,
  SharedMembersComponent,
  TitleDescriptionTableComponent,
  TitleDescriptionFormComponent,
  HijriDateRangeComponent,
  SummaryPipe,
  AcceptanceActionModalComponent,
  ConsultantsAssignmentModalComponent,
  HijriDateComponent,
  ImportsExportsScrollableTableComponent,
  RelatedRequestsScrollableTableComponent,
  TransactionTimelineScrollableTableComponent,
  DropzoneComponent,
  ViewImageModalComponent,

  SuccessModalComponent,
  ErrorDialogComponent,
  DelegateUserModalComponent,
  SelectRecommendationTypeModalComponent,
  SelectBenefitTypeModalComponent,
  SelectProcessTypeModalComponent,
  CommentModalComponent,
  TimeLineComponent,
  StudyProjectModalComponent,
  ProposedStudyDetailsComponent,
  StatementRequestModalComponent,
  SignatureFormatModalComponent,
  InitiateModalComponent,
  AuditingModalComponent,
  SummarizeExportDocumentModalComponent,
  ExportTemplateModalComponent,
  ExportModalComponent,
  SignaturePlaceHolderComponent,
  InitiatePlaceHolderComponent,
  ViewAttachmentsModalComponent,
  BarcodePlaceHolderComponent,
  InternalAssignmentUserModalComponent,
  ReUploadDocumentModalComponent,
  UploadCommitteeApprovalFileModalComponent,
  TablePaginatorComponent,
  EditorComponent,
  UserSearchComponent,
  CurrencyFormatterDirective,
  ConfirmModalComponent,
  InputSanitizerDirective,
  GlobalProgressSpinnerComponent,
  ViewFileModalComponent,
  FoundationSearchComponent,
  SubFoundationSearchComponent,
  MultiProgressBarComponent,
  // MultiSelectComponent,
  PageHeaderComponent,
  PageFilterComponent,

  TabsComponent,
  TabComponent,
  PdfViewerComponent,
  FormComponent,
  DatePickerRangeComponent,
  SearchFilterComponent,
  InlineCalendarComponent,
  SimplePdfModalComponent,
];

@NgModule({
  declarations: [...COMPONENTS, NormalPagePlaceholderComponent, InlineCalendarComponent],
  imports: [
    ...externalModules,
    KtdGridModule,
    PdfViewerModule,
    NgxChartsModule,
    AngularDraggableModule,
    SingleGregorianCalendarComponent,
    SingleHijriCalendarComponent,
    RangeGregorianCalendarComponent,
    NgbDatepicker,
    MultiSelectComponent,
    SingleSelectComponent,
    SlideToggleComponent,
    InputComponent,
    DatePickerComponent,
    TableComponent,
    ShowWhenNoDataDirective,
    MinutesToReadableTimePipe,
    TransactionNumberPipe,
    PriorityColorPipe,
    UploadAttachmentComponent,
    TableListComponent,
    BaseDialogComponent,
    DatePickerHijriComponent,
    AuthorizationContainerComponent,
  ],
  exports: [
    ...externalModules,
    ...COMPONENTS,
    InlineCalendarComponent,
    NgxChartsModule,
    PriorityColorPipe,
    DatePickerComponent,
    DatePickerHijriComponent,
    SingleSelectComponent,
  ],
  providers: [
    CurrencyPipe,
    DatePipe,
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }, // Ensure the locale matches the desired format
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class SharedModule {}

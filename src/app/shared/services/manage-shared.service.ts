import { Injectable } from '@angular/core';
import { BenefitTypesService } from '@core/services/backend-services/benefit-types.service';
import { ConsultantGroupsService } from '@core/services/backend-services/consultant-groups.service';
import { DocumentTypesService } from '@core/services/backend-services/document-types.service';
import { ExportableDocumentService } from '@core/services/backend-services/exportable-document.service';
import { FoundationsService } from '@core/services/backend-services/foundations.service';
import { OrganizationUnitsService } from '@core/services/backend-services/organization-units.service';
import { OutcomesService } from '@core/services/backend-services/outcomes.service';
import { ProcessTypeJustificationsService } from '@core/services/backend-services/process-type-justifications.service';
import { RecommendationTypesService } from '@core/services/backend-services/recommendation-types.service';
import { RecordsService } from '@core/services/backend-services/records.service';
import { ReferralJustificationsService } from '@core/services/backend-services/referral-justifications.service';
import { RequestsService } from '@core/services/backend-services/requests.service';
import { SignaturesService } from '@core/services/backend-services/signatures.service';
import { UsersService } from '@core/services/backend-services/users.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { UmAlQuraCalendarService } from '@core/services/backend-services/um-al-qura-calendar.service';


@Injectable({
  providedIn: 'root',
})
export class ManageSharedService {
  private deleteSignaturePlaceHolder$: BehaviorSubject<string> =
    new BehaviorSubject('');

  private deleteInitiatePlaceHolder$: BehaviorSubject<boolean> =
    new BehaviorSubject(false);

  private deleteBarcodePlaceHolder$: BehaviorSubject<boolean> =
    new BehaviorSubject(false);

  private deleteNormalPagePlaceHolder$: BehaviorSubject<number> =
    new BehaviorSubject(-1);

  private searchFormValue$: BehaviorSubject<{}> = new BehaviorSubject({});

  // 🔥 جديد — تخزين الفلاتر حسب الصفحة
  private filtersStorage: { [route: string]: any } = {};

  constructor(
    public organizationUnitsService: OrganizationUnitsService,
    public usersService: UsersService,
    public recommendationTypesService: RecommendationTypesService,
    public benefitTypesService: BenefitTypesService,
    public foundationsService: FoundationsService,
    public consultantGroupsService: ConsultantGroupsService,
    public referralJustificationsService: ReferralJustificationsService,
    public outcomesService: OutcomesService,
    public processTypeJustificationsService: ProcessTypeJustificationsService,
    public documentTypesService: DocumentTypesService,
    public requestsService: RequestsService,
    public signaturesService: SignaturesService,
    public recordsService: RecordsService,
    public exportableDocumentService: ExportableDocumentService,
    public UmAlQuraCalendarService: UmAlQuraCalendarService
  ) {}

  deleteSignaturePlaceHolder(userId: string): void {
    this.deleteSignaturePlaceHolder$.next(userId);
  }

  get SignaturePlaceHoldersDeletion(): Observable<string> {
    return this.deleteSignaturePlaceHolder$;
  }

  deleteInitiatePlaceHolder(): void {
    this.deleteInitiatePlaceHolder$.next(true);
  }

  get InitiatePlaceHoldersDeletion(): Observable<boolean> {
    return this.deleteInitiatePlaceHolder$;
  }

  deleteBarcodePlaceHolder(): void {
    this.deleteBarcodePlaceHolder$.next(true);
  }

  get BarcodePlaceHoldersDeletion(): Observable<boolean> {
    return this.deleteBarcodePlaceHolder$;
  }

  deleteNormalPaperPlaceHolder(normalPageIndex: number): void {
    this.deleteNormalPagePlaceHolder$.next(normalPageIndex);
  }

  get NormalPaperPlaceHoldersDeletion(): Observable<number> {
    return this.deleteNormalPagePlaceHolder$;
  }

  set searchFormValue(value: {}) {
    this.searchFormValue$.next(value);
  }

  get searchFormValue(): Observable<{}> {
    return this.searchFormValue$;
  }

  // ======================================================
  // 🔥 جديد — حفظ الفلاتر حسب مسار الصفحة (URL)
  // ======================================================
  setPageFilters(route: string, filters: any) {
    this.filtersStorage[route] = filters;
  }

  getPageFilters(route: string): any {
    return this.filtersStorage[route] || null;
  }

  clearPageFilters(route: string) {
    delete this.filtersStorage[route];
  }
}

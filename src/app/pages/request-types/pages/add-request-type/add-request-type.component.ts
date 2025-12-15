import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { arabicRegex, englishRegex } from '@core/utils/regex';
import { TranslateService } from '@ngx-translate/core';
import { compareFn, isTouched } from '@shared/helpers/helpers';

import { Location } from '@angular/common';
import { Observable, of } from 'rxjs';
import { LanguageService } from '@core/services/language.service';
import { ManageRequestTypesService } from '@pages/request-types/services/manage-request-types.service';
import { RequestTypeForm } from '@core/models/request-type.model';
import { Entity } from '@core/models/entity.model';
import { FormMode } from '@shared/enums/form-mode.enum';
import { AuthService } from '@core/services/auth/auth.service';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-add-request-type',
  templateUrl: './add-request-type.component.html',
  styleUrls: ['./add-request-type.component.scss'],
})
export class AddRequestTypeComponent {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  elementId: string = '';
  documentTypesList: Entity[] = [];
  schemasList$: Observable<{
    data: { id: string; title: string; titleEn: string }[];
    totalCount: number;
  }> = new Observable();
  classificationsList: { id: string; title: string; titleEn: string }[] = [];

  lang: string = 'ar';

  FormMode = FormMode;
  formMode: FormMode = FormMode.View;

  compareFn = compareFn;

  readonly selectedProperties: string[] = ['id', 'title', 'titleEn'];
  constructor(
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private manageRequestTypesService: ManageRequestTypesService,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private languageService: LanguageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.lang = this.languageService.language;
    this.elementId = this.activatedRoute.snapshot.params['id'];

    this.initializeForm();
    this.setFormMode();
    this.intializeDropDownLists();

    if (this.elementId) {
      this.manageRequestTypesService.requestTypesService
        .getRequestTypeById(this.elementId)
        .subscribe({
          next: (res) => {
            if (res.schema) {
              this.schemasList$ = of({ data: [res.schema], totalCount: 1 });
            }

            if (res.classifications.length) {
              this.classificationsList = res.classifications;
              setTimeout(() => {
                this.form.patchValue({
                  classifications: res.classifications,
                });
              });
            }

            this.patchForm({
              id: res.id,
              title: res.title,
              titleEn: res.titleEn,
              description: res.description,
              descriptionEn: res.descriptionEn,
              documentTypeId: res.documentType?.id,
              uiFormId: res.uiForm?.id,
              schema: res.schema,
              classifications: res.classifications,
              isTransaction: res.isTransaction,
            });
          },
        });
    }
  }

  initializeForm(): void {
    this.form = new FormGroup({
      id: new FormControl('', []),
      title: new FormControl('', [Validators.required, Validators.pattern(arabicRegex)]),
      titleEn: new FormControl('', [Validators.required, Validators.pattern(englishRegex)]),
      description: new FormControl('', [Validators.pattern(arabicRegex)]),
      descriptionEn: new FormControl('', [Validators.pattern(englishRegex)]),
      documentTypeId: new FormControl('', [Validators.required]),
      uiFormId: new FormControl('', []),
      schema: new FormControl('', [Validators.required]),
      classifications: new FormControl('', [Validators.required]),
      isTransaction: new FormControl(true, [Validators.required]),
    });
  }

  intializeDropDownLists(): void {
    this.manageRequestTypesService.documentTypesService
      .getDocumentTypesList({
        pageIndex: 0,
        pageSize: 100,
      })
      .subscribe({
        next: (res) => {
          this.documentTypesList = res.data;
        },
      });

    this.schemasList$ = this.manageRequestTypesService.schemasService.getSchemasList(
      {
        pageSize: 20,
        pageIndex: 0,
      },
      {
        isActive: true,
      },
      undefined,
      this.selectedProperties
    );

    this.manageRequestTypesService.classificationsService
      .getClassificationsList(
        {
          pageSize: 20,
          pageIndex: 0,
        },
        undefined,
        undefined,
        this.selectedProperties
      )
      .subscribe((res) => {
        this.classificationsList = res.data;
      });
  }

  patchForm(data: RequestTypeForm): void {
    this.form.patchValue(data);
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    let {
      id,
      title,
      titleEn,
      description,
      descriptionEn,
      documentTypeId,
      uiFormId,
      schema,
      classifications,
      isTransaction,
    } = this.form.value;

    classifications = classifications
      ? classifications.map((ele: { id: string; title: string; titleEn: string }) => ele.id)
      : [];

    if (this.elementId) {
      this.manageRequestTypesService.requestTypesService
        .updateRequestType({
          id,
          title,
          titleEn,
          description,
          descriptionEn,
          documentTypeId,
          uiFormId: uiFormId ? uiFormId : null,
          schemaId: schema.id,
          classifications,
          isTransaction,
        })
        .subscribe({
          next: (res) => {
            this.toastr.success(this.translateService.instant('shared.dataUpdatedSuccessfully'));
            this.navigateToTablePage();
          },

          error: (err) => {
            this.disableSubmitBtn = false;
          },
        });
    } else {
      this.manageRequestTypesService.requestTypesService
        .addRequestType({
          title,
          titleEn,
          description,
          descriptionEn,
          documentTypeId,
          uiFormId: uiFormId ? uiFormId : null,
          schemaId: schema.id,
          classifications,
          isTransaction,
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

  searchOnSchemas(event: { term: string; items: any[] }) {
    this.schemasList$ = this.manageRequestTypesService.schemasService.getSchemasList(
      {
        pageSize: 10,
        pageIndex: 0,
      },
      {
        searchKeyword: event.term,
      },
      undefined,
      this.selectedProperties
    );
  }

  searchOnClassifications(event: { term: string; items: any[] }) {
    this.manageRequestTypesService.classificationsService
      .getClassificationsList(
        {
          pageSize: 10,
          pageIndex: 0,
        },
        {
          searchKeyword: event.term,
        },
        undefined,
        this.selectedProperties
      )
      .subscribe((res) => {
        this.classificationsList = res.data;
      });
  }

  setFormMode(): void {
    if (
      this.authService.userPermissions.includes(PermissionsObj.CreateRequestType) ||
      this.authService.userPermissions.includes(PermissionsObj.UpdateRequestType)
    ) {
      this.formMode = FormMode.Modify;
    } else {
      this.form.disable();
    }
  }
}

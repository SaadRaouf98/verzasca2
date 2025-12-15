import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RequestContainerAdvancedSearchQueryParams } from '@core/models/request-container-advance-search.model';
import { AllTransactions } from '@core/models/transaction.model';
import { ManageTransactionsService } from '@pages/transactions/services/manage-transactions.service';
import { AdvancedSearchContentType } from '@shared/enums/advanced-search-content-type.enum';
import { AdvanedSearchOperator } from '@shared/enums/advanced-search-operator.enum';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { compareFn, isTouched } from '@shared/helpers/helpers';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-advanced-search-modal',
  templateUrl: './advanced-search-modal.component.html',
  styleUrls: ['./advanced-search-modal.component.scss'],
})
export class AdvancedSearchModalComponent implements OnInit {
  disableSubmitBtn: boolean = false;
  form!: FormGroup;
  containersList$: Observable<AllTransactions> = new Observable();
  AdvancedSearchContentType = AdvancedSearchContentType;
  AdvanedSearchOperator = AdvanedSearchOperator;

  compareFn = compareFn;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      header: string;
      buttonLabel: string;
    },
    private dialogRef: MatDialogRef<AdvancedSearchModalComponent>,
    private manageTransactionsService: ManageTransactionsService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.initializeDropDownList();
  }

  initializeForm(): void {
    this.form = new FormGroup({
      requestContainer: new FormControl(null, []),
      autoNumber: new FormControl('', []),
      title: new FormControl('', []),
      searchContentType: new FormControl(AdvancedSearchContentType.Import, []),
      searchContent: new FormControl('', []),
      foundation: new FormControl('', []),
      sector: new FormControl('', []),
      operator: new FormControl(AdvanedSearchOperator.Or, []),
    });
  }

  initializeDropDownList(): void {
    this.containersList$ =
      this.manageTransactionsService.requestContainersService.getTransactionsList(
        {
          pageSize: 10,
          pageIndex: 0,
        },
        undefined,
        undefined
      );
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    let {
      autoNumber,
      foundation,
      operator,
      requestContainer,
      searchContent,
      searchContentType,
      sector,
      title,
    } = this.form.value;
    const data: any = {
      autoNumber,
      foundation,
      operator,
      requestContainerId: requestContainer?.id,
      sector,
      title,
    };

    if (searchContentType == AdvancedSearchContentType.Import) {
      data.requests = searchContent;
    } else if (searchContentType == AdvancedSearchContentType.Export) {
      data.exportableDocuments = searchContent;
    } else if (searchContentType == AdvancedSearchContentType.StudyOutcome) {
      data.requestStepContents = searchContent;
    }

    this.dialogRef.close({
      status: 'Succeeded',
      statusCode: ModalStatusCode.Success,
      data,
    });
  }

  onCancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }

  searchOnContainers(event: { term: string; items: any[] }) {
    this.containersList$ =
      this.manageTransactionsService.requestContainersService.getTransactionsList(
        {
          pageSize: 10,
          pageIndex: 0,
        },
        {
          searchKeyword: event.term,
        },
        undefined,
        undefined
      );
  }
}


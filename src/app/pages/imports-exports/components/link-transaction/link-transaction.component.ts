import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { debounceTime, map } from 'rxjs';
import { RequestItem } from '@core/models/request.model';
import { LanguageService } from '@core/services/language.service';
import { removeSpecialCharacters } from '@shared/helpers/helpers';
import { RequestStatusTranslationMap } from '@core/enums/request-status.enum';

@Component({
  selector: 'app-link-transaction',
  templateUrl: './link-transaction.component.html',
  styleUrls: ['./link-transaction.component.scss'],
})
export class LinkTransactionComponent implements OnInit {
  searchKeywordControl = new FormControl();
  searchedResults: RequestItem[] = []; // TODO: linke transactions should use new model (RequestItem)
  selectedRequestsIds: string[] = [];
  disableSubmitBtn: boolean = false;
  isLoading: boolean = false;
  lang: string = 'ar';
  pageNumber: number = 0;
  RequestStatusTranslationMap = RequestStatusTranslationMap;
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      requestId: string;
      title: string;
      transactionNo: any;
      year: any;
    },
    private dialogRef: MatDialogRef<LinkTransactionComponent>,
    private manageImportsExportsService: ManageImportsExportsService,
    private langugaeService: LanguageService
  ) {}

  ngOnInit(): void {
    this.lang = this.langugaeService.language;
    // this.detectUserSearching();
    this.getSearchResults('');
  }

  // detectUserSearching(): void {
  //   this.searchKeywordControl.valueChanges
  //     .pipe(
  //       debounceTime(200),
  //       map((value) => {
  //         const sanitizedValue = removeSpecialCharacters(value);

  //         //if (sanitizedValue.length) {
  //         this.getSearchResults(sanitizedValue);
  //         //}
  //       })
  //     )
  //     .subscribe();
  // }
  onSearchClick(): void {
    const searchValue = this.searchKeywordControl.value || '';
    const sanitizedValue = removeSpecialCharacters(searchValue);
    this.getSearchResults(sanitizedValue);
  }
  onCancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }

  getSearchResults(searchedValue: string): void {
    this.isLoading = true;
    this.manageImportsExportsService.requestsService
      .getUnrelatedRequestsList(
        {
          pageSize: 10,
          pageIndex: this.pageNumber,
        },
        {
          searchFilterQuery: this.buildSearchKeyFilters(searchedValue),
        },
        undefined,
        ['id', 'importNumber', 'title', 'sector', 'consultants', 'status'], // TODO: update binding after update model to replace number with importNumber
        this.data?.requestId
      )
      .subscribe((res) => {
        this.isLoading = false;
        this.searchedResults = res.data;
      });
  }

  onSelect(request: RequestItem, check: boolean): void {
    request.checked = check;
  }

  buildSearchKeyFilters(searchText: string): any {
    if (searchText) {
      const encodedSearchText = encodeURIComponent(searchText);
      return `[
        ["title", "contains", "${encodedSearchText}"],
        "or",
        ["importNumber", "=", "${encodedSearchText}"],
        "or",
        ["autoNumber", "=", "${encodedSearchText}"]
      ]`;
    } else return;
  }

  linkTransaction(): void {
    this.disableSubmitBtn = true;

    this.manageImportsExportsService.requestsService
      .addRelatedRequests(this.data.requestId, {
        relatedRequestIds: this.searchedResults
          .filter((ele) => ele.checked)
          .map((ele) => ele.id),
      })
      .subscribe({
        next: (res) => {
          this.dialogRef.close({
            status: 'Succeeded',
            statusCode: ModalStatusCode.Success,
          });
        },
        error: (err) => {
          this.disableSubmitBtn = false;
        },
      });
  }

  hasUserChosenRequest(): boolean {
    return this.searchedResults.find((ele) => ele.checked) ? true : false;
  }
}

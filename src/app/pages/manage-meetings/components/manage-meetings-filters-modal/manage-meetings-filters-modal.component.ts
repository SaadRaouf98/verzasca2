import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Entity, AllEntities } from '@core/models/entity.model';
import { TransactionFilter } from '@core/models/transaction.model';
import { LanguageService } from '@core/services/language.service';
import { MY_FORMATS } from '@core/utils/date-picker-format';
import { ManageTransactionsService } from '@pages/transactions/services/manage-transactions.service';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import * as moment from 'moment';
import { Observable, debounceTime, map, of, startWith } from 'rxjs';

@Component({
  selector: 'app-manage-meetings-filters-modal',
  templateUrl: './manage-meetings-filters-modal.component.html',
  styleUrls: ['./manage-meetings-filters-modal.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class ManageMeetingsFiltersModalComponent {
  form!: FormGroup;

  selectedFilters: TransactionFilter[] = [];

  placeholder: string = 'shared.day/month/year';

  lang: string = 'ar';
  hijriDateCalendarInput!: {
    hijriFromDate: string;
    hijriToDate: string;
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ManageMeetingsFiltersModalComponent>,
    private languageService: LanguageService,
    private manageTransactionsService: ManageTransactionsService
  ) {}

  /**
   * Called by Angular.
   * It intializes form and set list of data to be displayed as dropdown select.
   */
  ngOnInit(): void {
    this.lang = this.languageService.language;

    if (this.lang === 'en') {
      this.placeholder = 'shared.englishDay/month/year';
    }

    this.initializeForm();
    //fill form incase user already filtered before
    this.fillForm();
  }

  initializeForm(): void {
    this.form = new FormGroup({
      fromDate: new FormControl(''),
      toDate: new FormControl(''),
      hijriFromDate: new FormControl(''),
      hijriFromDateDisplayedText: new FormControl(''),
      hijriToDate: new FormControl(''),
      hijriToDateDisplayedText: new FormControl(''),
    });
  }

  /**
   * Called by ngOnInit.
   * If selected filters are passed to this component then it patches from controls with proper format of this filter.
   */
  fillForm(): void {
    if (this.data.selectedFilters) {
      this.selectedFilters = this.data.selectedFilters;
      //
      this.selectedFilters.forEach((element) => {
        if (element.name == 'range') {
          const splitFromDate = element.fromDate!.split('-');
          this.form.patchValue({
            fromDate:
              splitFromDate[2] +
              '-' +
              splitFromDate[1] +
              '-' +
              splitFromDate[0],
          });
          if (element.toDate) {
            const splitToDate = element.toDate.split('-');
            this.form.patchValue({
              toDate:
                splitToDate[2] + '-' + splitToDate[1] + '-' + splitToDate[0],
            });
          }
        } else if (element.name == 'hijriRange') {
          const splitFromDate = element.fromDate!.split('-');
          this.form.patchValue({
            hijriFromDate:
              splitFromDate[2] +
              '-' +
              splitFromDate[1] +
              '-' +
              splitFromDate[0],
            hijriFromDateDisplayedText: element.displayedText.split('#الي#')[0],
          });
          if (element.toDate) {
            const splitToDate = element.toDate.split('-');
            this.form.patchValue({
              hijriToDate:
                splitToDate[2] + '-' + splitToDate[1] + '-' + splitToDate[0],
              hijriToDateDisplayedText: element.displayedText.split('#الي#')[1],
            });
            this.hijriDateCalendarInput = {
              hijriFromDate: this.form.value.hijriFromDate,
              hijriToDate: this.form.value.hijriToDate,
            };
          }
        }
      });
    }
  }

  onGregorianDateChanges(): void {
    const { fromDate, toDate } = this.form.value;
    if (fromDate && toDate) {
      const formattedFromDate = moment(fromDate).format('yyyy-MM-DD');
      const formattedToDate = moment(toDate).format('yyyy-MM-DD');

      this.form.patchValue({
        hijriFromDate: formattedFromDate,
        hijriToDate: formattedToDate,
      });

      this.hijriDateCalendarInput = {
        hijriFromDate: formattedFromDate,
        hijriToDate: formattedToDate,
      };

      setTimeout(() => {
        this.form.patchValue({
          hijriFromDateDisplayedText: document
            .getElementById('hijri-start')
            ?.parentNode?.querySelector('span')?.innerHTML,
          hijriToDateDisplayedText: document
            .getElementById('hijri-end')
            ?.parentNode?.querySelector('span')?.innerHTML,
        });
      }, 300);
    }
  }

  patchFormHijriDate(date: {
    hijriFromDate: string;
    hijriToDate: string;
    hijriFromDateDisplayedText: string | undefined;
    hijriToDateDisplayedText: string | undefined;
  }): void {
    //

    this.form.patchValue({
      hijriFromDate: date.hijriFromDate,
      hijriToDate: date.hijriToDate,
      hijriFromDateDisplayedText: date.hijriFromDateDisplayedText,
      hijriToDateDisplayedText: date.hijriToDateDisplayedText,
      //TODO:    the next lines may need to be deleted if user requested
      fromDate: date.hijriFromDate,
      toDate: date.hijriToDate,
    });
    //
  }
  /**
   * Called when user clicks on button "apply".
   * It closes the popup with success status and passes to the callee
   * the user selected filters in a proper format.
   */
  onApplyFilters(): void {
    this.selectedFilters = [];
    //
    const {
      fromDate,
      toDate,
      hijriFromDate,
      hijriFromDateDisplayedText,
      hijriToDate,
      hijriToDateDisplayedText,
    } = this.form.value;

    if (fromDate || toDate) {
      // DD-MM-yyyy HH:mm:ss
      const formattedFromDate = moment(fromDate).format('DD-MM-yyyy');
      let formattedToDate = undefined;
      if (toDate) {
        formattedToDate = moment(toDate).format('DD-MM-yyyy');
      }

      this.selectedFilters.push({
        id: '',
        fromDate: formattedFromDate,
        toDate: formattedToDate,
        name: 'range',
        displayedText: `${formattedFromDate} #To# ${formattedToDate}`,
      });
    }

    if (hijriFromDate || hijriToDate) {
      // DD-MM-yyyy HH:mm:ss
      const formattedHijriFromDate = moment(hijriFromDate).format('DD-MM-yyyy');
      let formattedHijriToDate = undefined;
      if (hijriToDate) {
        formattedHijriToDate = moment(hijriToDate).format('DD-MM-yyyy');
      }

      this.selectedFilters.push({
        id: '',
        fromDate: formattedHijriFromDate,
        toDate: formattedHijriToDate,
        name: 'hijriRange',
        displayedText: `${
          hijriFromDateDisplayedText || formattedHijriFromDate
        } #الي# ${hijriToDateDisplayedText || formattedHijriToDate}`,
      });
    }

    this.dialogRef.close({
      status: 'Succeeded',
      statusCode: ModalStatusCode.Success,
      selectedFilters: this.selectedFilters,
    });
  }

  /**
   * Called when user clicks on 'x' icon for close popuop.
   * It closes the filters popup.
   */
  onCancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }

  /**
   * Called when user clicks on button "reset".
   * It resets form and clears selectedFilters array.
   */
  onResetForm(): void {
    this.form.reset();
    this.selectedFilters = [];
  }

  displayItems = (option: { id: number; title: string; titleEn: string }) => {
    return this.lang === 'ar' ? option?.title : option?.titleEn;
  };
}

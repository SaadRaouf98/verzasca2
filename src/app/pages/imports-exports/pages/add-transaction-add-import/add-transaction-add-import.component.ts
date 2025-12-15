import { ViewChild } from '@angular/core';
import { AddImportComponent } from '@pages/imports-exports/components/add-import/add-import.component';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-add-transaction-add-import',
  templateUrl: './add-transaction-add-import.component.html',
  styleUrls: [
    './add-transaction-add-import.component.scss',
    '../request-details/request-details.component.scss',
  ],
})
export class AddTransactionAddImportComponent implements OnInit {
  @ViewChild(AddImportComponent) addImportComponent!: AddImportComponent;
  requestContainerIdFromUrl: string = '';
  requestContainerId: string = '';
  requestContainerData!: {
    foundation: { id: string; title: string; titleEn: string } | null;
    subFoundation: { id: string; title: string; titleEn: string } | null;
    concernedFoundations: {
      id: string;
      title: string;
      titleEn: string;
    }[];
    classificationId: string;
    users: { id: string; name: string }[];
  };
  cardData: {
    title: string;
    transactionNumber: string;
    sector: any;
    classification: any;
  };
  didUserChooseDocument: boolean = false;

  requestIdFromUrl: string = '';
  requestId: string = '';

  selectedContainerControl = new FormControl();
  showAddTransactionNextButton: boolean = false;
  showImport: boolean = false;
  lang: string = 'ar';

  constructor(
    private activatedRoute: ActivatedRoute,
    private manageImportsExportsService: ManageImportsExportsService,
    private location: Location
  ) {}

  ngOnInit(): void {
    //If user navigates to this page form the page of transaction details

    this.requestContainerIdFromUrl =
      this.activatedRoute.snapshot.params['requestContainerId'];

    if (this.requestContainerIdFromUrl) {
      this.requestContainerId = this.requestContainerIdFromUrl;
      this.manageImportsExportsService.requestContainersService
        .getTransactionById(this.requestContainerId)
        .subscribe((res) => {
          this.requestContainerData = {
            foundation: res.foundation,
            subFoundation: res.subFoundation,
            concernedFoundations: res.concernedFoundations,
            classificationId: res.classification.id,
            users: res.users,
          };
        });
    }

    //Check if user navigated to just add attachemnts for the request
    this.requestIdFromUrl = this.activatedRoute.snapshot.params['requestId'];

    if (this.requestIdFromUrl) {
      this.requestId = this.requestIdFromUrl;
    }
  }

  goToLastPage(): void {
    this.location.back();
  }

  onGOToNextStep(event: any): void {
    // Always reset both flags to false first
    this.showImport = false;
    this.didUserChooseDocument = false;

    // Reset cardData and form if switching to tab 3 (add file)
    if (event.cardData === null || event.cardData === undefined) {
      this.cardData = null;
      // Reset form in add-import via ViewChild if available
      if (this.addImportComponent && this.addImportComponent.form) {
        this.addImportComponent.form.reset();
      }
    } else if (event.cardData) {
      this.cardData = event.cardData;
    }

    if (event.showImport) {
      this.showImport = event.showImport;
    }

    if (event.requestContainerId) {
      this.requestContainerId = event.requestContainerId;
    }

    if (event.requestContainerData) {
      this.requestContainerData = event.requestContainerData;
    }

    if (event.requestId) {
      this.requestId = event.requestId;
    }

    if (event.didUserChooseDocument) {
      this.didUserChooseDocument = event.didUserChooseDocument;
    }
  }
}


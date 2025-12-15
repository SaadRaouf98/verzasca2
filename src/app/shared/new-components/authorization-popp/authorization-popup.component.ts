import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-authorization-popup',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatDialogModule],
  templateUrl: './authorization-popup.component.html',
  styleUrls: ['./authorization-popup.component.scss'],
})
export class AuthorizationPopupComponent implements OnInit {
  currentLanguage = '';
  constructor(
    private dialogRef: MatDialogRef<AuthorizationPopupComponent>,
    public translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      message: string;
      rptNumber: string;
      requestNumber: string;
      rptData: string;
 
      authorizationInside?: boolean;
      authorizationOutside?: boolean;
    }
  ) {
    this.currentLanguage = translateService.currentLang;
  }

  ngOnInit() {
    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.currentLanguage = event.lang;
    });


    !this.data
      ? (this.data = {
          message: '',
          title: '',
          rptNumber: '',
          requestNumber: '',
          rptData: '',
          authorizationInside: true,
          authorizationOutside: false,})
      : '';
  }

  action() {
    this.dialogRef.close();
  }
}

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
  selector: 'app-delete-popup',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatDialogModule],
  templateUrl: './delete-popup.component.html',
  styleUrls: ['./delete-popup.component.scss'],
})
export class DeletePopupComponent implements OnInit {
  currentLanguage = '';
  constructor(
    private dialogRef: MatDialogRef<DeletePopupComponent>,
    public translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      message: string;
      rptNumber: string;
      requestNumber: string;
      rptData: string;
      delete: boolean;
      Feedback: boolean;
      isTextCenter?: boolean;
    }
  ) {
    this.currentLanguage = translateService.currentLang;
  }

  ngOnInit() {
    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.currentLanguage = event.lang;
    });
    if (this.data.delete == null) {
      this.data.delete = true;
    }

    !this.data
      ? (this.data = {
          message: '',
          title: '',
          rptNumber: '',
          requestNumber: '',
          rptData: '',
          delete: false,
          Feedback: false,
        })
      : '';
  }

  onDelete() {
    this.dialogRef.close(true);
  }
}

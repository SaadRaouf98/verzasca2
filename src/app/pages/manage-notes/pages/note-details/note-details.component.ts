import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NoteDetails } from '@core/models/note.model';
import { LanguageService } from '@core/services/language.service';
import { ManageNotesService } from '@pages/manage-notes/services/manage-notes.service';
import { b64toBlob, isSmallDeviceWidthForPopup } from '@shared/helpers/helpers';
import { Location } from '@angular/common';
import { ExportedDocumentType } from '@core/enums/exported-docuemnt-type.enum';

import { PDFSource } from 'ng2-pdf-viewer';
import { DomSanitizer } from '@angular/platform-browser';
import { catchError, forkJoin, map, Observable, of, tap, throwError } from 'rxjs';
import { error } from 'jquery';
import { UpdateAccessibilityModalComponent } from '@pages/transactions/components/update-accessibility-modal/update-accessibility-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { TelephoneConsentModalComponent } from '@pages/manage-notes/components/telephone-consent-modal/telephone-consent-modal.component';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-note-details',
  templateUrl: './note-details.component.html',
  styleUrls: ['./note-details.component.scss'],
})
export class NoteDetailsComponent {
  noteId: string = '';
  noteDetails!: NoteDetails;
  isNoteFileLoading: boolean = true;
  noteFile: {
    fileBase64: string | undefined;
    pdfSrc: string | Uint8Array | PDFSource | undefined;
    name: string;
  } = {
    fileBase64: undefined,
    pdfSrc: undefined,
    name: '',
  };
  ExportedDocumentType = ExportedDocumentType;
  isLoading: boolean = true;
  lang: string = 'ar';

  constructor(
    private manageNotesService: ManageNotesService,
    private activatedRoute: ActivatedRoute,
    private langugaeService: LanguageService,
    private location: Location,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
    private toastr: CustomToastrService
  ) {}

  ngOnInit(): void {
    this.lang = this.langugaeService.language;
    this.noteId = this.activatedRoute.snapshot.params['id'];

    let requests: Observable<any>[] = [];

    requests.push(
      this.getNoteDetails().pipe(
        catchError((error) => {
          // handle error
          this.isLoading = false;
          return of(error);
        })
      )
    );

    requests.push(
      this.loadNoteFile().pipe(
        catchError((error) => {
          if (error.status === 404) {
            this.toastr.error('عفوا هذا الملف غير موجود');
          }
          this.isLoading = false;
          return of(error);
        })
      )
    );

    forkJoin({
      ...requests,
    }).subscribe({
      next: (results) => {
        this.isLoading = false;
      },
    });
  }
  onOpenTelephoneConsentModal(): void {
    this.dialog.open(TelephoneConsentModalComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '600px',
      autoFocus: false,
      disableClose: false,
      data: {
        noteId: this.noteId,
      },
    });
  }

  getNoteDetails(): Observable<void> {
    return this.manageNotesService.notesService.getNote(this.noteId).pipe(
      map((res) => {
        this.noteDetails = res;
      })
    );
  }

  loadNoteFile(): Observable<void> {
    return this.manageNotesService.notesService.getFile(this.noteId).pipe(
      map((res) => {
        this.isNoteFileLoading = false;
        this.noteFile.name = res.name;
        this.noteFile.fileBase64 = res.file;
        this.noteFile.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
          URL.createObjectURL(b64toBlob(this.noteFile.fileBase64, 'application/pdf'))
        );
      })
    );
  }

  onNavigateBack(): void {
    this.location.back();
  }

  protected readonly PermissionsObj = PermissionsObj;
}

import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ManageNotesService } from '@pages/manage-notes/services/manage-notes.service';
import { b64toBlob } from '@shared/helpers/helpers';
import { PDFSource } from 'ng2-pdf-viewer';

import { Location } from '@angular/common';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-note-file-viewer',
  templateUrl: './note-file-viewer.component.html',
  styleUrls: ['./note-file-viewer.component.scss'],
})
//دائما الملف هنا pdf
export class NoteFileViewerComponent implements OnInit {
  noteId: string = '';
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

  constructor(
    private manageNotesService: ManageNotesService,
    private activatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private toastr: CustomToastrService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.noteId = this.activatedRoute.snapshot.params['id'];
    this.loadNoteFile();
  }

  loadNoteFile(): void {
    this.isNoteFileLoading = true;

    this.manageNotesService.notesService.getFile(this.noteId).subscribe({
      next: (res) => {
        this.isNoteFileLoading = false;
        this.noteFile.name = res.name;
        this.noteFile.fileBase64 = res.file;

        this.noteFile.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
          URL.createObjectURL(b64toBlob(this.noteFile.fileBase64, 'application/pdf'))
        );
      },
      error: (err) => {
        if (err.status === 404) {
          this.toastr.error('عفوا هذا الملف غير موجود');
        }
      },
    });
  }

  onNavigateBack(): void {
    this.location.back();
  }
}

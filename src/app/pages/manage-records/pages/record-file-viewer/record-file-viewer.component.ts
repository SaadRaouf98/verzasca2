import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ManageRecordsService } from '@pages/manage-records/services/manage-records.service';
import { b64toBlob } from '@shared/helpers/helpers';
import { PDFSource } from 'ng2-pdf-viewer';

import { Location } from '@angular/common';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-record-file-viewer',
  templateUrl: './record-file-viewer.component.html',
  styleUrls: ['./record-file-viewer.component.scss'],
})
export class RecordFileViewerComponent implements OnInit {
  recordId: string = '';
  isRecordFileLoading: boolean = true;
  recordFile: {
    fileBase64: string | undefined;
    pdfSrc: string | Uint8Array | PDFSource | undefined;
    name: string;
  } = {
    fileBase64: undefined,
    pdfSrc: undefined,
    name: '',
  };

  constructor(
    private manageRecordsService: ManageRecordsService,
    private activatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private toastr: CustomToastrService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.recordId = this.activatedRoute.snapshot.params['id'];
    this.loadRecordFile();
  }

  loadRecordFile(): void {
    this.isRecordFileLoading = true;

    this.manageRecordsService.recordsService.getRecordFile(this.recordId).subscribe({
      next: (res) => {
        this.isRecordFileLoading = false;
        this.recordFile.name = res.name;
        this.recordFile.fileBase64 = res.file;

        this.recordFile.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
          URL.createObjectURL(b64toBlob(this.recordFile.fileBase64, 'application/pdf'))
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

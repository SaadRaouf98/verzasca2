import { Component, Input } from '@angular/core';
import { ApprovedAmountMechanism } from '@core/enums/approved-amount-mechanism.enum';
import { ExportedDocumentType } from '@core/enums/exported-docuemnt-type.enum';
import { NoteType } from '@core/enums/note-type.enum';
import { RecordType } from '@core/enums/record-type.enum';
import { RequestExportRecommendation } from '@core/models/request.model';
import { environment } from '@env/environment';

@Component({
  selector: 'app-proposed-study-details',
  templateUrl: './proposed-study-details.component.html',
  styleUrls: ['./proposed-study-details.component.scss'],
})
export class ProposedStudyDetailsComponent {
  @Input() data!: RequestExportRecommendation;
  @Input() requestId!: string;
  @Input() lang!: string;

  ApprovedAmountMechanism = ApprovedAmountMechanism;
  ExportedDocumentType = ExportedDocumentType;
  RecordType = RecordType;
  NoteType = NoteType;
  environment = environment;

  constructor() {}

  formatProcessTypeJustifications(
    processTypeJustifications: { id: string; title: string; titleEn: string }[]
  ): string {
    if (this.lang === 'ar') {
      return processTypeJustifications.map((ele) => ele.title).join(' ,');
    }
    return processTypeJustifications.map((ele) => ele.titleEn).join(' ,');
  }
}

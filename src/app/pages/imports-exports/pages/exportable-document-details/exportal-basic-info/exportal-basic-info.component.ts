import { Component, Input } from '@angular/core';
import { statusTranslationMap } from '@core/enums/request-container-status.enum';

import { RequestDetails } from '@core/models/request.model';

@Component({
  selector: 'app-exportal-basic-info',

  templateUrl: './exportal-basic-info.component.html',
  styleUrls: ['./exportal-basic-info.component.scss'],
})
export class ExportalBasicInfoComponent {
  statusTranslationMap = statusTranslationMap;
  @Input() requestDetails!: RequestDetails;
}

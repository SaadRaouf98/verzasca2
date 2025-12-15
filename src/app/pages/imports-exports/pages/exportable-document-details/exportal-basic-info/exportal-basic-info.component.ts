import { Component, Input } from '@angular/core';

import {
  RequestDetails,
} from '@core/models/request.model';


@Component({
  selector: 'app-exportal-basic-info',

  templateUrl: './exportal-basic-info.component.html',
  styleUrls: ['./exportal-basic-info.component.scss'],
})
export class ExportalBasicInfoComponent {
  @Input() requestDetails!: RequestDetails;
 
}

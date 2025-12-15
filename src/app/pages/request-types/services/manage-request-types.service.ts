import { Injectable } from '@angular/core';
import { ClassificationsService } from '@core/services/backend-services/classifications.service';
import { DocumentTypesService } from '@core/services/backend-services/document-types.service';
import { RequestTypesService } from '@core/services/backend-services/request-types.service';
import { SchemasService } from '@core/services/backend-services/schemas.service';

@Injectable({
  providedIn: 'root',
})
export class ManageRequestTypesService {
  constructor(
    public requestTypesService: RequestTypesService,
    public schemasService: SchemasService,
    public classificationsService: ClassificationsService,
    public documentTypesService: DocumentTypesService
  ) {}
}

import { Injectable } from '@angular/core';
import { RolesService } from '@core/services/backend-services/roles.service';

@Injectable({
  providedIn: 'root',
})
export class ManagePermissionsSettingsService {
  constructor(public rolesService: RolesService) {}
}

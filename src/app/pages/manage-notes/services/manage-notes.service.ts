import { Injectable } from '@angular/core';
import { ClassificationsService } from '@core/services/backend-services/classifications.service';
import { NotesService } from '@core/services/backend-services/notes.service';
import { PrioritiesService } from '@core/services/backend-services/priorities.service';
import { UsersService } from '@core/services/backend-services/users.service';

@Injectable({
  providedIn: 'root',
})
export class ManageNotesService {
  constructor(
    public notesService: NotesService,
    public usersService: UsersService,
    public prioritiesService: PrioritiesService,
    public classificationsService: ClassificationsService
  ) {}
}

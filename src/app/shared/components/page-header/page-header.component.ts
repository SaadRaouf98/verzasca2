import {Component, EventEmitter, Inject, Input, Output} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AllUsers } from '@core/models/user.model';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { compareFn, isTouched } from '@shared/helpers/helpers';
import { ManageSharedService } from '@shared/services/manage-shared.service';
import { Observable } from 'rxjs';
import {HeaderAction} from "@shared/models/header-actions.interface";

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
})
export class PageHeaderComponent {
  /** e.g. "Project Requests" */
  @Input() title = '';

  /** displayed in parentheses after title */
  @Input() count?: number;

  /** list of right-side buttons */
  @Input() actions: HeaderAction[] = [];

  /** show a back button at far left */
  @Input() showBack = false;

  /** icon class for back (e.g. "fa fa-arrow-left") */
  @Input() backIcon = 'fa fa-arrow-left';

  /** emits when a right-side button is clicked */
  @Output() action = new EventEmitter<string>();

  /** emits when back is clicked */
  @Output() back = new EventEmitter<void>();

  onAction(id: string) {
    this.action.emit(id);
  }

  onBack() {
    this.back.emit();
  }
}

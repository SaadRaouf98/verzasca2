import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActionType } from '@core/enums/action-type.enum';
import { LinkAction } from '@core/models/workflow/link.model';
import { LanguageService } from '@core/services/language.service';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { compareFn, isTouched } from '@shared/helpers/helpers';

@Component({
  selector: 'app-select-actions-modal',
  templateUrl: './select-actions-modal.component.html',
  styleUrls: ['./select-actions-modal.component.scss'],
})
export class SelectActionsModalComponent implements OnInit {
  actionsList!: LinkAction[];
  form!: FormGroup;
  lang: string = 'ar';

  compareFn = compareFn;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { allActions: LinkAction[]; selectedActions?: LinkAction[] },
    private dialogRef: MatDialogRef<SelectActionsModalComponent>,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    //There are 4 actions that can't be shown in the list
    const unselectedActions = [
      ActionType.Delegate,
      ActionType.Reject,
      ActionType.Archiving,
      ActionType.Close,
    ];
    this.actionsList = this.data.allActions.filter(
      (ele) => !unselectedActions.includes(ele.actionType)
    );

    this.lang = this.languageService.language;
    this.initializeForm();
    if (this.data.selectedActions) {
      this.form.patchValue({
        actions: this.data.selectedActions,
      });
    }
  }

  initializeForm(): void {
    this.form = new FormGroup({
      actions: new FormControl('', [Validators.required]),
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close({
        status: 'Succeed',
        statusCode: ModalStatusCode.Success,
        data: {
          selectedActions: this.form.value.actions,
          selectedActionsIds: this.form.value.actions.map(
            (ele: LinkAction) => ele.id
          ),
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }
}

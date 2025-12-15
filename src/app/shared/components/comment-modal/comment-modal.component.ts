import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { isSmallDeviceWidthForPopup, isTouched } from '@shared/helpers/helpers';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { ActionType } from '@core/enums/action-type.enum';

@Component({
  selector: 'app-comment-modal',
  templateUrl: './comment-modal.component.html',
  styleUrls: ['./comment-modal.component.scss'],
})
export class CommentModalComponent implements OnInit {
  disableSubmitBtn: boolean = false;
  form!: FormGroup;

  @ViewChild('fileToUpload') fileToUpload!: ElementRef;

  constructor(
    // @Inject(MAT_DIALOG_DATA)
    // public data: {
    //   header: string;
    //   textAreaLabel: string;
    //   buttonLabel: string;
    //   actionType: ActionType;
    // },
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CommentModalComponent>,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = new FormGroup({
      comment: new FormControl('', []),
    });
  }

  // onSubmitOLD(): void {
  //   if (!this.form.valid) {
  //     return;
  //   }

  //   //If Action type is 'Archiving' or 'Close'
  //   if (
  //     this.data.actionType === ActionType.Archiving ||
  //     this.data.actionType === ActionType.Close
  //   ) {
  //     const dialogRef = this.dialog.open(ConfirmModalComponent, {
  //       minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '1000px',
  //       maxWidth: '95vw',
  //       autoFocus: false,
  //       disableClose: true,
  //       data: {
  //         bodyMessage:
  //           this.data.actionType === ActionType.Archiving
  //             ? 'في حالة الارشفة سيتم الابقاء على رقم مخرج الدراسة.'
  //             : 'في حالة الاغلاق سيتم حذف مخرج الدراسة.',
  //       },
  //     });

  //     dialogRef
  //       .afterClosed()
  //       .subscribe(
  //         (dialogResult: { statusCode: ModalStatusCode; status: string }) => {
  //           if (dialogResult.statusCode === ModalStatusCode.Success) {
  //             this.continueSubmission();
  //           }
  //         }
  //       );
  //     return;
  //   }

  //   //If Action type is 'Reject'
  //   if (this.data.actionType === ActionType.Reject) {
  //     this.continueSubmission();
  //   }
  // }

  onSubmit(): void {
    this.disableSubmitBtn = true;
    let { comment } = this.form.value;

    this.dialogRef.close({
      status: 'Succeeded',
      statusCode: ModalStatusCode.Success,
      data: {
        comment,
      },
    });
  }
  // continueSubmission(): void {
  //   this.disableSubmitBtn = true;
  //   let { comment } = this.form.value;

  //   this.dialogRef.close({
  //     status: 'Succeeded',
  //     statusCode: ModalStatusCode.Success,
  //     data: {
  //       comment,
  //     },
  //   });
  // }
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

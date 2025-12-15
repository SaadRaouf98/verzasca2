import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.scss'],
})
export class ErrorDialogComponent {
  hasDefaultMessage: boolean = false;
  isConnectionLost: boolean = false; // True when there is no connection to the internet
  isError: boolean = true; // True for errors, False for alerts

  constructor(
    public dialogRef: MatDialogRef<ErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public err: HttpErrorResponse
  ) {}

  ngOnInit(): void {
    if (this.err && this.err.error instanceof ProgressEvent) {
      this.isConnectionLost = true;
    } else if (
      !this.err ||
      this.err.error instanceof ErrorEvent ||
      this.err.status === 500
    ) {
      this.hasDefaultMessage = true;
    } else if (
      this.err.status === 400 ||
      this.err.status === 409 ||
      this.err.status === 199
    ) {
      this.isError = false;
    }
  }

  close() {
    this.dialogRef.close();
  }
}

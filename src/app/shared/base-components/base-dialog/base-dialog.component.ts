import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-base-dialog',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './base-dialog.component.html',
  styleUrls: ['./base-dialog.component.scss'],
})
export class BaseDialogComponent {
  @Input() data: any; // Add this input property
  @Input() disableSubmitBtn: boolean = false;
  @Input() formValid: boolean = true;

  @Output() submitted = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public injectedData: any,
    private dialogRef: MatDialogRef<BaseDialogComponent>
  ) {
    // Use injected data as fallback if no input data is provided
    this.data = this.injectedData;
  }

  onSubmit(): void {
    this.submitted.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
    this.dialogRef.close(false);
  }
}

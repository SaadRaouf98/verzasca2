// src/app/shared/slide-toggle/slide-toggle.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  Renderer2,
  Inject,
} from '@angular/core';
import {
  MatSlideToggleChange,
  MatSlideToggleModule,
} from '@angular/material/slide-toggle';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-slide-toggle',
  template: `
    <mat-slide-toggle
      [checked]="checked"
      (change)="onToggle($event)"
      class="custom-slide-toggle"
    >
    </mat-slide-toggle>
  `,
  styleUrls: ['./sidenav-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatSlideToggleModule],
})
export class SlideToggleComponent {
  /** true = drawer is checked (mini), false = expanded */
  @Input() checked = false;
  /** emits the new checked state */
  @Output() onSlideChange = new EventEmitter<boolean>();

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    // Checked is true if light-theme is present
    this.checked = this.document.body.classList.contains('light-theme');
  }

  onToggle(event: MatSlideToggleChange) {
    this.onSlideChange.emit(event.checked);
    if (event.checked) {
      this.document.body.classList.remove('dark-theme');
      this.document.body.classList.add('light-theme');
      this.checked = true;
    } else {
      this.document.body.classList.remove('light-theme');
      this.document.body.classList.add('dark-theme');
      this.checked = false;
    }
  }
}

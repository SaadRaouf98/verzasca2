import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
})
export class ProgressBarComponent {
  @Input() progress!: number;
  @Input() backgroundColor!: string;
  @Input() foregroundColor!: string;
  @Input() borderRadius!: number;
  @Input() transitionDuration!: number;
}

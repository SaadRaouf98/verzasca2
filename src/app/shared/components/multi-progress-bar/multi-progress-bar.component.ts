import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-multi-progress-bar',
  templateUrl: './multi-progress-bar.component.html',
  styleUrls: ['./multi-progress-bar.component.scss'],
})
export class MultiProgressBarComponent {
  @Input() divsProgress!: {
    percentage: number;
    foregroundColor: string;
    count: number;
  }[];
  @Input() backgroundColor!: string;
  @Input() borderRadius!: number;
  @Input() transitionDuration!: number;
}

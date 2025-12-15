import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
})
export class StepperComponent {
  @ViewChild('timeline') timeline!: ElementRef<HTMLDivElement>;

  steps = [
    {
      label: 'المعاملات',
      date: '12/2/2023 - 01:00PM',
      status: 'orange',
      value: '15.81',
    },
    {
      label: 'المعاملات',
      date: '12/3/2023 - 01:00PM',
      status: 'green',
      value: '64.63',
    },
    // ...more steps
  ];

  scrollLeft() {
    this.timeline.nativeElement.scrollBy({ left: -200, behavior: 'smooth' });
  }

  scrollRight() {
    this.timeline.nativeElement.scrollBy({ left: 200, behavior: 'smooth' });
  }
}

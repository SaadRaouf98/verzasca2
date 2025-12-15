import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { RequestTimeLine } from '@core/models/request.model';
import { RequestContainerTimeLine } from '@core/models/transaction.model';

@Component({
  selector: 'app-time-line',
  templateUrl: './time-line.component.html',
  styleUrls: ['./time-line.component.scss'],
})
export class TimeLineComponent implements AfterViewInit {
  @Input() data!: RequestContainerTimeLine[] | RequestTimeLine[];

  @ViewChild('lastElement') lastElement!: ElementRef;
  @ViewChild('timelineScroll') timelineScroll!: ElementRef<HTMLDivElement>;

  canScrollLeft = false;
  canScrollRight = false;

  ngAfterViewInit(): void {
    // Initial scroll to last element
    this.lastElement.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    });

    // Add scroll event listener
    if (this.timelineScroll?.nativeElement) {
      this.timelineScroll.nativeElement.addEventListener('scroll', () => {
        this.updateScrollButtons();
      });
    }

    // Check initial scroll state (multiple checks to ensure it's updated)
    setTimeout(() => this.updateScrollButtons(), 100);
    setTimeout(() => this.updateScrollButtons(), 500);
    setTimeout(() => this.updateScrollButtons(), 1000);
  }

  ngOnInit(): void {}

  scrollTimeline(offset: number) {
    if (this.timelineScroll?.nativeElement) {
      this.timelineScroll.nativeElement.scrollBy({
        left: offset,
        behavior: 'smooth',
      });

      // Update buttons after scroll completes
      setTimeout(() => {
        this.updateScrollButtons();
      }, 300);
    }
  }

  updateScrollButtons() {
    if (this.timelineScroll?.nativeElement) {
      const element = this.timelineScroll.nativeElement;
      const scrollLeft = element.scrollLeft;
      const scrollWidth = element.scrollWidth;
      const clientWidth = element.clientWidth;
      const maxScroll = scrollWidth - clientWidth;

      // Check if we're in RTL mode
      const isRTL = getComputedStyle(element).direction === 'rtl';

      // If content fits entirely within the container, hide both arrows
      if (scrollWidth <= clientWidth) {
        this.canScrollLeft = false;
        this.canScrollRight = false;
      } else {
        if (isRTL) {
          // Try different RTL implementations
          let atStart, atEnd;

          if (scrollLeft <= 0) {
            // Negative scrollLeft implementation (Firefox, some browsers)
            atStart = scrollLeft >= -1; // Near 0 or positive
            atEnd = scrollLeft <= -(scrollWidth - clientWidth) + 1; // Near max negative
          } else {
            // Positive scrollLeft implementation (Chrome, Safari)
            atStart = scrollLeft <= 1; // Near 0
            atEnd = scrollLeft >= scrollWidth - clientWidth - 1; // Near max
          }

          this.canScrollLeft = !atEnd; // Can scroll to previous (right)
          this.canScrollRight = !atStart; // Can scroll to next (left)
        } else {
          // LTR behavior
          this.canScrollLeft = scrollLeft > 1;
          this.canScrollRight = scrollLeft < maxScroll - 1;
        }
      }
    }
  }
}

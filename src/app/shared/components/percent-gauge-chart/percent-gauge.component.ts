import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { RequestContainerStatus } from '@core/enums/request-container-status.enum';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'percent-gauge-chart',
  templateUrl: './percent-gauge.component.html',
  standalone: true,
  styleUrls: ['./percent-gauge.component.scss'],
  imports: [NgxChartsModule],
})
export class PercentGaugeChart implements OnInit, OnChanges {
  @Input() value;
  @Input() max: number = 30;
  @Input() showTarget: boolean = false;
  @Input() color: string;
  @Input() status: RequestContainerStatus;
  statusClass: string = '';
  @Output() statusChange = new EventEmitter<string>();
  // element.containerStatus === RequestContainerStatus.Open

  displayChart: boolean = false;
  view: any = [125, 130]; // Example view dimensions
  colorScheme = {
    domain: [],
  };
  // Format function to add the percentage symbol
  format(data) {
    return data;
  }

  ngOnInit(): void {
    // Parse the incoming value into a JS number using a robust normalizer.
    // This handles Arabic/Persian numerals, Arabic decimal separators, commas,
    // percent signs, parentheses, whitespace and extracts the first numeric token.
    this.parseValue();
  }
  ngOnChanges(): void {
    // Re-parse when inputs change
    this.parseValue();
  }
  customCssClass: string = '';
  private parseValue(): void {
    try {
      this.value = this.toNumber(this.value);

      setTimeout(() => {
        // Use switch(true) so case expressions can be boolean conditions.
        switch (true) {
          // If the container status is closed => completed (green)
          case this.status === RequestContainerStatus.Close:
            this.colorScheme.domain = ['#4CAF50', '#4CAF50', '#4CAF50', '#4CAF50'];
            this.customCssClass = 'complete';
            this.statusChange.emit(this.customCssClass);
            this.value = 100;
            this.displayChart = true;
            return;

          // negative values => late (red)
          case typeof this.value === 'number' && this.value < 0:
            this.colorScheme.domain = ['#D32F2F', '#D32F2F', '#D32F2F', '#D32F2F'];
            this.customCssClass = 'late';
            this.statusChange.emit(this.customCssClass);
            this.displayChart = true;
            return;

          // positive values => hasTime (default color)
          case typeof this.value === 'number' && this.value > 0:
            this.colorScheme.domain = ['#7F404F', '#7F404F', '#7F404F', '#7F404F'];
            this.customCssClass = 'hasTime';
            this.displayChart = true;
            this.statusChange.emit(this.customCssClass);
            return;

          default:
            this.colorScheme.domain = ['#7F404F', '#7F404F', '#7F404F', '#7F404F'];
            this.displayChart = true;
            return;
        }
      }, 10);
    } catch (e) {
      // on error, set NaN so consumers can handle it
      this.value = NaN as any;
    }
  }

  private toNumber(input: any): number {
    if (input === null || input === undefined) return NaN;
    let s = String(input).trim();

    // Replace Arabic-Indic digits U+0660..U+0669
    s = s.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
    // Replace Eastern Arabic / Persian digits U+06F0..U+06F9
    s = s.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));

    // Normalize decimal separator (Arabic decimal '٫' -> '.')
    s = s.replace(/٫/g, '.');

    // Remove common thousands separators and non-breaking spaces
    s = s.replace(/[٬,\s\u00A0\u202F]/g, '');

    // Remove percent sign or other trailing non-numeric characters, but keep leading '-' and '.'
    // Extract the first match of an optional sign + digits with optional decimal part
    const m = s.match(/-?\d+(?:\.\d+)?/);
    if (!m) return NaN;
    return Number(m[0]);
  }
  constructor() {}
}

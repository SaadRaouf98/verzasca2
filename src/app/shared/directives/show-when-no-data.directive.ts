// show-when-no-data.directive.ts

import {
  Directive,
  Input,
  ElementRef,
  OnChanges,
  SimpleChanges,
  Renderer2,
} from '@angular/core';

/**
 * Directive that watches a bound data input.
 * If the data is empty (array/object/string) or falsy, it injects a "no data" view:
 *  - For <table> hosts: replaces <tbody> content with a single <tr><td colspan="…"> containing the view.
 *  - For other hosts: clears innerHTML and appends the view directly.
 */
@Directive({
  selector: '[appShowWhenNoData]',
  standalone: true,
})
export class ShowWhenNoDataDirective implements OnChanges {
  /**
   * The data to check. Can be an array, object, string, or null/undefined.
   * If empty/falsy, the "no data" view is shown.
   */
  @Input() appShowWhenNoData!: any[] | object | null | undefined | string;

  /** URL of the placeholder image to show when there's no data */
  @Input() appShowWhenNoDataNoImage = 'assets/images/no-data.png';

  /** Optional text caption to display under the "no data" image */
  @Input() appShowWhenNoDataText = '';

  /** Keeps track of the last element we injected so we can remove it on changes */
  private lastInjected: HTMLElement | null = null;

  /**
   * @param hostRef  Reference to the host element (table or any container)
   * @param renderer Angular Renderer2 to perform safe DOM manipulations
   */
  constructor(
    private hostRef: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {}

  /**
   * Called whenever an @Input() property changes.
   * We only care when `appShowWhenNoData` changes.
   */
  ngOnChanges(changes: SimpleChanges) {
    // If the bound data input didn't change, do nothing
    if (!changes['appShowWhenNoData']) {
      return;
    }

    const data = this.appShowWhenNoData;

    // Determine if we consider this "has data"
    const hasData = Array.isArray(data)
      ? data.length > 0 // non-empty array
      : typeof data === 'string'
      ? data.trim().length > 0 // non-empty string
      : data && Object.keys(data).length > 0; // non-empty object

    const hostEl = this.hostRef.nativeElement;

    // If we previously injected a fallback, remove it before proceeding
    if (this.lastInjected) {
      const parent = this.lastInjected.parentNode;
      if (parent) {
        this.renderer.removeChild(parent, this.lastInjected);
      }
      this.lastInjected = null;
    }

    // If there *is* data, leave the host content as-is and exit
    if (hasData) {
      return;
    }

    // === Build the "no data" fallback view ===
    // A wrapper <div> that centers its contents
    const wrapper = this.renderer.createElement('div');
    this.renderer.addClass(wrapper, 'no-data-wrapper');
    this.renderer.setStyle(wrapper, 'display', 'flex');
    this.renderer.setStyle(wrapper, 'flex-direction', 'column');
    this.renderer.setStyle(wrapper, 'align-items', 'center');
    this.renderer.setStyle(wrapper, 'justify-content', 'center');

    // The placeholder <img>
    const img = this.renderer.createElement('img');
    this.renderer.setAttribute(img, 'src', this.appShowWhenNoDataNoImage);
    this.renderer.setAttribute(img, 'alt', 'No data');
    this.renderer.setStyle(img, 'max-width', '200px');
    this.renderer.appendChild(wrapper, img);

    // Optional <p> caption under the image
    if (this.appShowWhenNoDataText) {
      const p = this.renderer.createElement('p');
      const txt = this.renderer.createText(this.appShowWhenNoDataText);
      this.renderer.appendChild(p, txt);
      this.renderer.appendChild(wrapper, p);
    }

    // === Inject differently if the host is a <table> ===
    if (hostEl.tagName.toLowerCase() === 'table') {
      const table = hostEl as HTMLTableElement;

      // Find or create a <tbody> under the table
      let tbody = table.querySelector('tbody') as any;
      if (!tbody) {
        tbody = this.renderer.createElement('tbody');
        this.renderer.appendChild(table, tbody);
      }

      // Clear all existing rows in <tbody>
      Array.from(tbody.children).forEach((child) =>
        this.renderer.removeChild(tbody, child)
      );

      // Create a new <tr> with one <td> spanning all columns
      const colCount = table.querySelectorAll('thead th').length || 1;
      const tr = this.renderer.createElement('tr');
      const td = this.renderer.createElement('td');
      this.renderer.setAttribute(td, 'colspan', colCount.toString());
      this.renderer.setStyle(td, 'text-align', 'center');

      // Put our wrapper (image + text) inside that <td>
      this.renderer.appendChild(td, wrapper);
      this.renderer.appendChild(tr, td);
      this.renderer.appendChild(tbody, tr);

      // Remember so we can remove it on next change
      this.lastInjected = tr;
    } else {
      // === Non-table hosts ===
      // Clear everything inside the host element
      this.renderer.setProperty(hostEl, 'innerHTML', '');

      // Append our wrapper directly
      this.renderer.appendChild(hostEl, wrapper);
      this.lastInjected = wrapper;
    }
  }
}

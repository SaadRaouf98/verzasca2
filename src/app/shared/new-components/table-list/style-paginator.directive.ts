import {
  ElementRef,
  AfterViewInit,
  Directive,
  Host,
  Optional,
  Renderer2,
  Self,
  ViewContainerRef,
  Input,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatButton } from '@angular/material/button';
import { TranslateService } from '@ngx-translate/core';

interface PageObject {
  length: number;
  pageIndex: number;
  pageSize: number;
  previousPageIndex: number;
}

@Directive({
  selector: '[style-paginator]',
  standalone: true,
})
export class StylePaginatorDirective {
  private _pageGapTxt = '...';
  private _rangeStart: number;
  private _rangeEnd: number;
  private _buttons = [];
  private _totalRecordsAdded = false;
  private _curPageObj: PageObject = {
    length: 0,
    pageIndex: 0,
    pageSize: 0,
    previousPageIndex: 0,
  };

  @Input()
  get showTotalPages(): number {
    return this._showTotalPages;
  }
  set showTotalPages(value: number) {
    this._showTotalPages = value % 2 == 0 ? value + 1 : value;
  }
  private _showTotalPages = 2;

  get inc(): number {
    return this._showTotalPages % 2 == 0 ? this.showTotalPages / 2 : (this.showTotalPages - 1) / 2;
  }

  get numOfPages(): number {
    return this.matPag.getNumberOfPages();
  }

  get lastPageIndex(): number {
    return this.matPag.getNumberOfPages() - 1;
  }

  constructor(
    @Host() @Self() @Optional() private readonly matPag: MatPaginator,
    private vr: ViewContainerRef,
    private ren: Renderer2,
    private translate: TranslateService
  ) {
    //to rerender buttons on items per page change and first, last, next and prior buttons
    this.matPag.page.subscribe((e: PageObject) => {
      if (this._curPageObj.pageSize != e.pageSize && this._curPageObj.pageIndex != 0) {
        e.pageIndex = 0;
        this._rangeStart = 0;
        this._rangeEnd = this._showTotalPages - 1;
      }
      this._curPageObj = e;

      this.initPageRange();
    });
  }

  private buildPageNumbers() {
    // Find the correct container based on Material version
    let actionContainer = this.vr.element.nativeElement.querySelector(
      'div.mat-mdc-paginator-range-actions'
    );

    if (!actionContainer) {
      actionContainer = this.vr.element.nativeElement.querySelector(
        'div.mat-paginator-range-actions'
      );
    }

    if (!actionContainer) {
      console.warn('Page numbers container not found');
      return;
    }

    const nextPageNode = actionContainer.querySelector('button.mat-mdc-paginator-navigation-next');

    // remove buttons before creating new ones
    if (this._buttons.length > 0) {
      this._buttons.forEach((button) => {
        if (button.parentNode) {
          this.ren.removeChild(actionContainer, button);
        }
      });
      //Empty state array
      this._buttons.length = 0;
    }

    //Style existing navigation buttons
    setTimeout(() => {
      const buttons = actionContainer.querySelectorAll('button');
      buttons.forEach((btn: HTMLElement) => {
        if (
          btn.getAttribute('aria-label')?.includes('Next') ||
          btn.getAttribute('aria-label')?.includes('Previous') ||
          btn.getAttribute('aria-label')?.includes('First') ||
          btn.getAttribute('aria-label')?.includes('Last')
        ) {
          if (btn.hasAttribute('disabled')) {
            this.ren.setStyle(btn, 'background-color', 'rgba(190, 130, 130, 1)');
            this.ren.setStyle(btn, 'color', 'white');
          } else {
            this.ren.setStyle(btn, 'background-color', 'rgba(255, 0, 0, 1)');
            this.ren.setStyle(btn, 'color', 'white');
          }
        }
      });
    }, 100);

    for (let i = 0; i < this.numOfPages; i++) {
      if (i >= this._rangeStart && i <= this._rangeEnd) {
        const btn = this.createButton(i, this.matPag.pageIndex);
        if (nextPageNode && nextPageNode.parentNode) {
          this.ren.insertBefore(nextPageNode.parentNode, btn, nextPageNode);
        } else if (actionContainer) {
          this.ren.appendChild(actionContainer, btn);
        }
      }

      if (i == this._rangeEnd && this._rangeEnd < this.lastPageIndex) {
        // Only show ... if there's a gap between rangeEnd and lastPageIndex
        if (this._rangeEnd + 1 < this.lastPageIndex) {
          const gapBtn = this.createButton(this._pageGapTxt, this._rangeEnd);
          if (nextPageNode && nextPageNode.parentNode) {
            this.ren.insertBefore(nextPageNode.parentNode, gapBtn, nextPageNode);
          } else if (actionContainer) {
            this.ren.appendChild(actionContainer, gapBtn);
          }
        }

        // Add last page button after the gap
        const lastPageBtn = this.createButton(this.lastPageIndex, this.matPag.pageIndex);
        if (nextPageNode && nextPageNode.parentNode) {
          this.ren.insertBefore(nextPageNode.parentNode, lastPageBtn, nextPageNode);
        } else if (actionContainer) {
          this.ren.appendChild(actionContainer, lastPageBtn);
        }
      }
    }

    // Add total records count display once
    if (!this._totalRecordsAdded) {
      this.addTotalRecordsDisplay();
      this._totalRecordsAdded = true;
    } else {
      // Update existing total records display
      this.updateTotalRecordsDisplay();
    }
  }

  private addTotalRecordsDisplay(): void {
    // Find the page size container
    let pageSizeContainer = this.vr.element.nativeElement.querySelector(
      'div.mat-mdc-paginator-page-size'
    );

    if (!pageSizeContainer) {
      pageSizeContainer = this.vr.element.nativeElement.querySelector(
        'div.mat-paginator-page-size'
      );
    }

    if (!pageSizeContainer) return;

    // Create total records container
    const totalContainer = this.ren.createElement('div');
    this.ren.addClass(totalContainer, 'custom-total-records');

    // Create the text content with translation
    const translatedLabel = this.translate.instant('shared.total');
    const totalText = this.ren.createText(`${translatedLabel} ${this.matPag.length}`);
    this.ren.appendChild(totalContainer, totalText);

    // Append to page size container
    this.ren.appendChild(pageSizeContainer, totalContainer);
  }

  private updateTotalRecordsDisplay(): void {
    // Find the existing total records display
    let pageSizeContainer = this.vr.element.nativeElement.querySelector(
      'div.mat-mdc-paginator-page-size'
    );

    if (!pageSizeContainer) {
      pageSizeContainer = this.vr.element.nativeElement.querySelector(
        'div.mat-paginator-page-size'
      );
    }

    if (!pageSizeContainer) return;

    // Find and remove old total records container
    const oldTotalContainer = pageSizeContainer.querySelector('div.custom-total-records');
    if (oldTotalContainer) {
      oldTotalContainer.remove();
    }

    // Create new total records container with updated value
    const totalContainer = this.ren.createElement('div');
    this.ren.addClass(totalContainer, 'custom-total-records');

    // Create the text content with translation
    const translatedLabel = this.translate.instant('shared.total');
    const totalText = this.ren.createText(`${translatedLabel} ${this.matPag.length}`);
    this.ren.appendChild(totalContainer, totalText);

    // Append to page size container
    this.ren.appendChild(pageSizeContainer, totalContainer);
  }

  private createButton(i: any, pageIndex: number): any {
    const linkBtn: any = this.ren.createElement('span');
    const pagingTxt = isNaN(i) ? this._pageGapTxt : +(i + 1);
    const text = this.ren.createText(pagingTxt + '');

    this.ren.addClass(linkBtn, 'mat-custom-page');
    switch (i) {
      case pageIndex:
        this.ren.addClass(linkBtn, 'mat-custom-page-active');
        break;
      case this._pageGapTxt:
        let newIndex = this._curPageObj.pageIndex + this._showTotalPages;

        if (newIndex >= this.numOfPages) newIndex = this.lastPageIndex;

        if (pageIndex != this.lastPageIndex) {
          this.ren.listen(linkBtn, 'click', () => {
            this.switchPage(newIndex);
          });
        }

        if (pageIndex == this.lastPageIndex) {
          this.ren.addClass(linkBtn, 'mat-custom-page-active');
        }
        break;
      default:
        this.ren.listen(linkBtn, 'click', () => {
          this.switchPage(i);
        });
        break;
    }

    this.ren.appendChild(linkBtn, text);
    //Add button to private array for state
    this._buttons.push(linkBtn);
    return linkBtn;
  }
  //calculates the button range based on class input parameters and based on current page index value. Used to render new buttons after event.
  private initPageRange(): void {
    const middleIndex = (this._rangeStart + this._rangeEnd) / 2;

    this._rangeStart = this.calcRangeStart(middleIndex);
    this._rangeEnd = this.calcRangeEnd(middleIndex);

    this.buildPageNumbers();
  }

  //Helper function To calculate start of button range
  private calcRangeStart(middleIndex: number): number {
    switch (true) {
      case this._curPageObj.pageIndex == 0 && this._rangeStart != 0:
        return 0;
      case this._curPageObj.pageIndex > this._rangeEnd:
        return this._curPageObj.pageIndex + this.inc > this.lastPageIndex
          ? this.lastPageIndex - this.inc * 2
          : this._curPageObj.pageIndex - this.inc;
      case this._curPageObj.pageIndex > this._curPageObj.previousPageIndex &&
        this._curPageObj.pageIndex > middleIndex &&
        this._rangeEnd < this.lastPageIndex:
        return this._rangeStart + 1;
      case this._curPageObj.pageIndex < this._curPageObj.previousPageIndex &&
        this._curPageObj.pageIndex < middleIndex &&
        this._rangeStart > 0:
        return this._rangeStart - 1;
      default:
        return this._rangeStart;
    }
  }
  //Helpter function to calculate end of button range
  private calcRangeEnd(middleIndex: number): number {
    switch (true) {
      case this._curPageObj.pageIndex == 0 && this._rangeEnd != this._showTotalPages:
        return this._showTotalPages - 1;
      case this._curPageObj.pageIndex > this._rangeEnd:
        return this._curPageObj.pageIndex + this.inc > this.lastPageIndex
          ? this.lastPageIndex
          : this._curPageObj.pageIndex + 1;
      case this._curPageObj.pageIndex > this._curPageObj.previousPageIndex &&
        this._curPageObj.pageIndex > middleIndex &&
        this._rangeEnd < this.lastPageIndex:
        return this._rangeEnd + 1;
      case this._curPageObj.pageIndex < this._curPageObj.previousPageIndex &&
        this._curPageObj.pageIndex < middleIndex &&
        this._rangeStart >= 0 &&
        this._rangeEnd > this._showTotalPages - 1:
        return this._rangeEnd - 1;
      default:
        return this._rangeEnd;
    }
  }
  //Helper function to switch page on non first, last, next and previous buttons only.
  private switchPage(i: number): void {
    const previousPageIndex = this.matPag.pageIndex;
    this.matPag.pageIndex = i;
    this.matPag['_emitPageEvent'](previousPageIndex);
    this.initPageRange();
  }
  //Initialize default state after view init
  public ngAfterViewInit() {
    this._rangeStart = 0;
    this._rangeEnd = this._showTotalPages - 1;
    this.initPageRange();
  }
}

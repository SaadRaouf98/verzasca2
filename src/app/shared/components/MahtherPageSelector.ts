import { Component, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'page-selector',
  styles: [],
  host: {},
  template: ``,
})
export class MahtherPageSelector {
  @Output('select') select: EventEmitter<{ page: number; selected: boolean }> =
    new EventEmitter();
  @Input('page') page!: number;
  selected = false;

  emitClick() {
    this.selected = !this.selected;
    this.select.emit({ page: this.page, selected: this.selected });
  }
}

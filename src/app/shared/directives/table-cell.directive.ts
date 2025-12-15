import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({ selector: '[appTableCell]', standalone: true })
export class TableCellDirective {
  @Input('appTableCell') columnKey!: string;
  constructor(public template: TemplateRef<any>) {}
}

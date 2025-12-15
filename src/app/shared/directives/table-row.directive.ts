import { Directive, TemplateRef } from '@angular/core';

@Directive({ selector: '[appRowDetail]', standalone: true })
export class TableRowDetailDirective {
  constructor(public template: TemplateRef<any>) {}
}

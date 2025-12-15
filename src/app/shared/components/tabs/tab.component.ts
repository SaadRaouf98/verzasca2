// src/app/shared/tabs/tab.component.ts
import {
  Component,
  Input,
  TemplateRef,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-tab',
  template: `
    <ng-template #contentTpl>
      <ng-content></ng-content>
    </ng-template>
  `,
})
export class TabComponent {
  /** Header text */
  @Input() title!: string;
  /** New: custom CSS class(es) for this tab’s header */
  @Input() headerClass: string | string[] = '';
  /** If true, this tab is active on init */
  @Input() active = false;

  /** Grab that template so the container can stamp it out */
  @ViewChild('contentTpl', { static: true })
  template!: TemplateRef<any>;
}

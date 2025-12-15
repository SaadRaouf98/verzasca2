// src/app/shared/input/input.component.ts
import {
  Component,
  ChangeDetectionStrategy, AfterContentInit, ContentChildren, QueryList, SimpleChanges, Input, OnChanges,
} from '@angular/core';
import {TabComponent} from './tab.component';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent implements AfterContentInit, OnChanges {
  @ContentChildren(TabComponent) tabs!: QueryList<TabComponent>;

  /** Zero-based index of the tab to activate */
  @Input() activeTabIndex: number | null = null;
  /** New: custom CSS class(es) for the header <ul> */
  @Input() headerClass: string | string[] = '';
  activeTab?: TabComponent;

  ngAfterContentInit() {
    // initial selection: either the one marked active, or index, or first
    this.applyActiveIndex();
  }

  ngOnChanges(changes: SimpleChanges) {
    // react to changes to activeTabIndex
    if (changes['activeTabIndex'] && !changes['activeTabIndex'].isFirstChange()) {
      this.applyActiveIndex();
    }
  }

  private applyActiveIndex() {
    // if parent passed an index and it's valid, select that
    if (
      this.activeTabIndex != null &&
      this.activeTabIndex >= 0 &&
      this.activeTabIndex < this.tabs.length
    ) {
      this.selectTab(this.tabs.toArray()[this.activeTabIndex]);
    } else {
      // fallback: the one with [active]="true" or the first one
      const pre = this.tabs.find(t => t.active);
      this.selectTab(pre || this.tabs.first);
    }
  }

  selectTab(tab: TabComponent) {
    this.tabs.forEach(t => (t.active = false));
    tab.active = true;
    this.activeTab = tab;
  }
}

import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calendar-scheduler',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule],
  templateUrl: './calendar-scheduler.component.html',
  styleUrls: ['./calendar-scheduler.component.scss'],
})
export class CalendarSchedulerComponent implements OnInit {
  @Input() externalItems: any[] = []; // list shown on the left that can be dragged
  @Input() keepExternalCopy: boolean = false; // if true, external list keeps original items after drop
  /**
   * Optional initial events array. Each item should be { date: 'YYYY-MM-DD', payload: any }
   */
  @Input() initialEvents: { date: string; payload: any }[] = [];
  /**
   * Optional localStorage key to persist events. If provided, events are saved/loaded.
   */
  @Input() persistKey?: string;
  /**
   * Main categories that a dropped item can be assigned to. Each category should have `id` and `name`.
   */
  @Input() mainCategories: { id: string; name: string }[] = [];

  @Output() eventDropped = new EventEmitter<{ item: any; date: string }>();
  @Output() eventRemoved = new EventEmitter<{ item: any; date: string }>();

  public displayMonth: number;
  public displayYear: number;
  public days: { 
    date: string; 
    label: number; 
    events: any[]; 
    inMonth: boolean;
    categoryGroups: { categoryId: string | null; categoryName: string; items: any[] }[];
  }[] = [];
  // internal map of date->events to persist across month navigation
  private eventsMap: Record<string, any[]> = {};
  // central list of all dropped items with metadata (id, payload, date, categoryId)
  public droppedItems: { id: number; payload: any; date: string; categoryId?: string | null }[] = [];
  private _nextEventId = 1;
  // Pending external drop state (waiting for user to pick category)
  public pendingDrop: {
    item: any;
    dayIndex: number;
    prevId?: string;
    prevIndex?: number;
  } | null = null;
  public pendingSelectedCategory?: string | null = null;

  // Helper getters for CDK connected lists (templates can't use arrow funcs)
  get daysIds(): string[] {
    return this.days.map((d) => 'day-' + d.date);
  }

  get allDropListIds(): string[] {
    return ['externalList', ...this.daysIds];
  }

  constructor() {
    const now = new Date();
    this.displayMonth = now.getMonth();
    this.displayYear = now.getFullYear();
  }
weekdays: string[] = ['الاحد','الاثنين','الثلاثاء','الاربعاء','الخميس','الجمعة','السبت'];
  ngOnInit(): void {
    this.buildMonth(this.displayYear, this.displayMonth);
    this.externalItems = [
        {
            "title": "Event 1",
            "description": "Description for Event 1"
        },
        {
            "title": "Event 2",
            "description": "Description for Event 2"
        }
    ]
    // load initial events
    this.mainCategories = [
        {
            id: 'cat1',
            name: 'Category 1'
        },
        {
            id: 'cat2',
            name: 'Category 2'
        },
         {
            id: 'cat3',
            name: 'Category 3'
        }
        ];
    this.loadInitialEvents();
  }

  private loadInitialEvents() {
    // load from localStorage if key provided
    if (this.persistKey) {
      try {
        const raw = localStorage.getItem(this.persistKey!);
        if (raw) {
          this.eventsMap = JSON.parse(raw) || {};
        }
      } catch (e) {
        // ignore parse errors
      }
    }

    // merge provided initialEvents (create internal drop records)
    for (const ev of this.initialEvents || []) {
      if (!ev || !ev.date) continue;
      const rec = { id: this._nextEventId++, payload: ev.payload, date: ev.date, categoryId: (ev as any).categoryId || null };
      this.droppedItems.push(rec);
      this.eventsMap[ev.date] = this.eventsMap[ev.date] || [];
      this.eventsMap[ev.date].push(rec);
    }

    // populate days if already built
    if (this.days && this.days.length) {
      this.populateDaysFromMap();
    }
  }

  private persistMap() {
    if (!this.persistKey) return;
    try {
      localStorage.setItem(this.persistKey, JSON.stringify(this.eventsMap));
    } catch (e) {
      // ignore storage errors
    }
  }

  private toYMD(d: Date) {
    // Use local date components to avoid UTC offset issues from toISOString()
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const dd = d.getDate();
    const mm = m < 10 ? '0' + m : '' + m;
    const day = dd < 10 ? '0' + dd : '' + dd;
    return `${y}-${mm}-${day}`;
  }

  buildMonth(year: number, month: number) {
    this.days = [];
    // first day of month
    const first = new Date(year, month, 1);
    const startDay = first.getDay(); // 0 (Sun) - 6 (Sat)

    // number of days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // previous month days to fill first week
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    const leading = startDay; // number of days from prev month

    // Build leading days
    for (let i = leading - 1; i >= 0; i--) {
      const day = new Date(year, month - 1, prevMonthLastDate - i);
      this.days.push({ date: this.toYMD(day), label: day.getDate(), events: [], inMonth: false, categoryGroups: [] });
    }

    // Build current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const day = new Date(year, month, d);
      this.days.push({ date: this.toYMD(day), label: d, events: [], inMonth: true, categoryGroups: [] });
    }

    // Fill trailing days to complete 6 rows (6*7 = 42 cells) for consistent layout
    while (this.days.length < 42) {
      const idx = this.days.length - (leading + daysInMonth) + 1;
      const day = new Date(year, month + 1, idx);
      this.days.push({ date: this.toYMD(day), label: day.getDate(), events: [], inMonth: false, categoryGroups: [] });
    }
    // populate events for visible days
    this.populateDaysFromMap();
  }

  prevMonth() {
    if (this.displayMonth === 0) {
      this.displayMonth = 11;
      this.displayYear -= 1;
    } else {
      this.displayMonth -= 1;
    }
    this.buildMonth(this.displayYear, this.displayMonth);
  }

  nextMonth() {
    if (this.displayMonth === 11) {
      this.displayMonth = 0;
      this.displayYear += 1;
    } else {
      this.displayMonth += 1;
    }
    this.buildMonth(this.displayYear, this.displayMonth);
  }

  // When an item is dropped into a day
  dropToDay(event: CdkDragDrop<any[]>, dayIndex: number) {
    // When dropping from external list or another day
    if (event.previousContainer === event.container) {
      // reorder inside same day (not implemented now)
      return;
    }

    const prevId = event.previousContainer.id ? event.previousContainer.id.toString() : '';

    // If dragging from another day (move)
    if (prevId.startsWith('day-')) {
      const prevDate = prevId.replace('day-', '');
      const item = event.previousContainer.data[event.previousIndex];
      // remove from previous container data
      event.previousContainer.data.splice(event.previousIndex, 1);
      // remove from prev map
      const prevArr = this.eventsMap[prevDate] || [];
      // prevArr contains drop records; remove by id when possible
      const prevIdx = prevArr.findIndex((x) => x.id === (item && item.id));
      if (prevIdx > -1) prevArr.splice(prevIdx, 1);
      this.eventsMap[prevDate] = prevArr;

      // add to target day; update item's date and update central droppedItems
      if (item && item.id) {
        item.date = this.days[dayIndex].date;
        this.droppedItems = this.droppedItems.map((r) => (r.id === item.id ? { ...r, date: item.date } : r));
      }
      this.days[dayIndex].events.push(item);
      this.eventsMap[this.days[dayIndex].date] = this.eventsMap[this.days[dayIndex].date] || [];
      this.eventsMap[this.days[dayIndex].date].push(item);
      this.populateDaysFromMap();
      this.persistMap();
      this.eventDropped.emit({ item, date: this.days[dayIndex].date });
      console.log('moved item between days', item, prevDate, this.days[dayIndex].date);
      return;
    }

    // Otherwise treat as external list drop
      const item = event.previousContainer.data[event.previousIndex];
      // Instead of immediately adding, open a small modal to select the main category
      this.pendingDrop = {
        item: item,
        dayIndex: dayIndex,
        prevId: prevId,
        prevIndex: event.previousIndex,
      };
    // default selected category
    this.pendingSelectedCategory = this.mainCategories && this.mainCategories.length ? this.mainCategories[0].id : null;
    return;
  }

  

  private populateDaysFromMap() {
    for (const d of this.days) {
      const dateEvents = (this.eventsMap[d.date] || []).slice();
      d.events = dateEvents;
      
      // Group events by category
      const groupMap = new Map<string | null, any[]>();
      
      for (const evt of dateEvents) {
        const catId = evt.categoryId || null;
        if (!groupMap.has(catId)) {
          groupMap.set(catId, []);
        }
        groupMap.get(catId)!.push(evt);
      }
      
      // Build categoryGroups array
      d.categoryGroups = [];
      
      // Add groups in category order (if mainCategories exist)
      if (this.mainCategories && this.mainCategories.length) {
        for (const cat of this.mainCategories) {
          if (groupMap.has(cat.id)) {
            d.categoryGroups.push({
              categoryId: cat.id,
              categoryName: cat.name,
              items: groupMap.get(cat.id)!
            });
            groupMap.delete(cat.id);
          }
        }
      }
      
      // Add uncategorized items (null category)
      if (groupMap.has(null)) {
        d.categoryGroups.push({
          categoryId: null,
          categoryName: 'Uncategorized',
          items: groupMap.get(null)!
        });
        groupMap.delete(null);
      }
      
      // Add any remaining categories not in mainCategories
      for (const [catId, items] of groupMap.entries()) {
        d.categoryGroups.push({
          categoryId: catId,
          categoryName: catId || 'Unknown',
          items: items
        });
      }
    }
  }

  // Helper to resolve category name by id (avoid arrow functions in template)
  public getCategoryName(id: string | undefined | null): string {
    if (!id) return '';
    const found = this.mainCategories && this.mainCategories.find((c) => c.id === id);
    return (found && found.name) || id || '';
  }
  removeEvent(dayIndex: number, eventId: number) {
    const day = this.days[dayIndex];
    if (!day) return;
    const arr = this.eventsMap[day.date] || [];
    const idx = arr.findIndex((x) => x.id === eventId);
    if (idx === -1) return;
    const removed = arr.splice(idx, 1)[0];
    this.eventsMap[day.date] = arr;
    // update droppedItems central list
    this.droppedItems = this.droppedItems.filter((r) => r.id !== eventId);
    // if configured, return payload to external list
    try {
      this.externalItems.push(removed.payload);
    } catch (e) {
      // ignore
    }
    // refresh visible day events
    if (this.days[dayIndex].events !== arr) this.days[dayIndex].events = arr;
    this.persistMap();
    this.eventRemoved.emit({ item: removed, date: day.date });
  }

  removeEventFromCategory(dayIndex: number, categoryId: string | null, eventIndexInCategory: number) {
    const day = this.days[dayIndex];
    if (!day) return;
    
    // Find the category group
    const group = day.categoryGroups.find(g => g.categoryId === categoryId);
    if (!group || !group.items || eventIndexInCategory >= group.items.length) return;
    
    // Get the event to remove
    const eventToRemove = group.items[eventIndexInCategory];
    
    // Remove from eventsMap
    const arr = this.eventsMap[day.date] || [];
    const idx = arr.findIndex((x) => x.id === eventToRemove.id);
    if (idx !== -1) {
      const removed = arr.splice(idx, 1)[0];
      this.eventsMap[day.date] = arr;
      
      // Update droppedItems central list
      this.droppedItems = this.droppedItems.filter((r) => r.id !== eventToRemove.id);
      
      // If configured, return payload to external list
      try {
        this.externalItems.push(removed.payload);
      } catch (e) {
        // ignore
      }
      
      // Repopulate the day to refresh categoryGroups
      this.populateDaysFromMap();
      
      this.persistMap();
      this.eventRemoved.emit({ item: removed, date: day.date });
    }
  }

  // (grouping helpers removed — reverted to original behavior)

  // Sort an events array in-place so items with same category are grouped together
  private sortEventsArray(arr: any[]): void {
    if (!arr || !arr.length) return;
    const orderMap: Record<string, number> = {};
    if (this.mainCategories) {
      this.mainCategories.forEach((c, i) => (orderMap[c.id] = i));
    }
    const fallbackIndex = Object.keys(orderMap).length + 1000;
    arr.sort((a: any, b: any) => {
      const aId = a && a.categoryId ? a.categoryId : '';
      const bId = b && b.categoryId ? b.categoryId : '';
      const ao = aId ? (orderMap[aId] !== undefined ? orderMap[aId] : fallbackIndex) : fallbackIndex + 1;
      const bo = bId ? (orderMap[bId] !== undefined ? orderMap[bId] : fallbackIndex) : fallbackIndex + 1;
      if (ao !== bo) return ao - bo;
      const aid = a && a.id ? a.id : 0;
      const bid = b && b.id ? b.id : 0;
      return aid - bid;
    });
  }
mainMeeting
coordinationMeeting
preparatoryMeeting
  // Confirm a pending external drop by assigning the selected category and adding the event
  confirmPendingDrop() {
    if (!this.pendingDrop) return;
    const { item, dayIndex, prevId, prevIndex } = this.pendingDrop;
    // create internal drop record so we can track it centrally
    const rec = { id: this._nextEventId++, payload: item, date: this.days[dayIndex].date, categoryId: this.pendingSelectedCategory };
    this.droppedItems.push(rec);
    this.eventsMap[this.days[dayIndex].date] = this.eventsMap[this.days[dayIndex].date] || [];
    this.eventsMap[this.days[dayIndex].date].push(rec);
    // group/sort and refresh visible day (sort mutates in-place)
    this.sortEventsArray(this.eventsMap[this.days[dayIndex].date]);
    if (this.days[dayIndex].events !== this.eventsMap[this.days[dayIndex].date]) this.days[dayIndex].events = this.eventsMap[this.days[dayIndex].date];
    this.populateDaysFromMap();
    console.log('added new dropped item', this.eventsMap);
  
    // remove from external list if configured to move rather than copy
    if (!this.keepExternalCopy && prevId === 'externalList' && typeof prevIndex === 'number') {
      // defend against index out of range
      if (prevIndex >= 0 && prevIndex < this.externalItems.length) {
        this.externalItems.splice(prevIndex, 1);
      }
    }
    this.persistMap();
    this.eventDropped.emit({ item: rec, date: this.days[dayIndex].date });
    this.pendingDrop = null;
    this.pendingSelectedCategory = null;
  }

  cancelPendingDrop() {
    this.pendingDrop = null;
    this.pendingSelectedCategory = null;
  }
}

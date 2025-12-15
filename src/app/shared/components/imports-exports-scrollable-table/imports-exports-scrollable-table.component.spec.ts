import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportsExportsScrollableTableComponent } from './imports-exports-scrollable-table.component';

describe('ImportsExportsScrollableTableComponent', () => {
  let component: ImportsExportsScrollableTableComponent;
  let fixture: ComponentFixture<ImportsExportsScrollableTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImportsExportsScrollableTableComponent]
    });
    fixture = TestBed.createComponent(ImportsExportsScrollableTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

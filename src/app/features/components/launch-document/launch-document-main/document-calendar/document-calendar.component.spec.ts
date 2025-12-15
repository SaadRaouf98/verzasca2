import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentCalendarComponent } from './document-calendar.component';

describe('DocumentCalendarComponent', () => {
  let component: DocumentCalendarComponent;
  let fixture: ComponentFixture<DocumentCalendarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DocumentCalendarComponent]
    });
    fixture = TestBed.createComponent(DocumentCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

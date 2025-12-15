import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessTypeJustificationsListComponent } from './process-type-justifications-list.component';

describe('ProcessTypeJustificationsListComponent', () => {
  let component: ProcessTypeJustificationsListComponent;
  let fixture: ComponentFixture<ProcessTypeJustificationsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProcessTypeJustificationsListComponent]
    });
    fixture = TestBed.createComponent(ProcessTypeJustificationsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

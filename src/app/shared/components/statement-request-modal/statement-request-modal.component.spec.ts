import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatementRequestModalComponent } from './statement-request-modal.component';

describe('StatementRequestModalComponent', () => {
  let component: StatementRequestModalComponent;
  let fixture: ComponentFixture<StatementRequestModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StatementRequestModalComponent]
    });
    fixture = TestBed.createComponent(StatementRequestModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

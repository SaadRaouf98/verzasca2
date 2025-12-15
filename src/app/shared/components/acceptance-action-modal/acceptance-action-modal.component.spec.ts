import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptanceActionModalComponent } from './acceptance-action-modal.component';

describe('AcceptanceActionModalComponent', () => {
  let component: AcceptanceActionModalComponent;
  let fixture: ComponentFixture<AcceptanceActionModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AcceptanceActionModalComponent]
    });
    fixture = TestBed.createComponent(AcceptanceActionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

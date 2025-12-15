import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingRequestViewComponent } from './pending-request-view.component';

describe('PendingRequestViewComponent', () => {
  let component: PendingRequestViewComponent;
  let fixture: ComponentFixture<PendingRequestViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PendingRequestViewComponent]
    });
    fixture = TestBed.createComponent(PendingRequestViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

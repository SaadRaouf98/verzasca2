import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingRequestListComponent } from './pending-request-list.component';

describe('PendingRequestListComponent', () => {
  let component: PendingRequestListComponent;
  let fixture: ComponentFixture<PendingRequestListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PendingRequestListComponent]
    });
    fixture = TestBed.createComponent(PendingRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

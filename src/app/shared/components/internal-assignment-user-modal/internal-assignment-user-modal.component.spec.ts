import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternalAssignmentUserModalComponent } from './internal-assignment-user-modal.component';

describe('InternalAssignmentUserModalComponent', () => {
  let component: InternalAssignmentUserModalComponent;
  let fixture: ComponentFixture<InternalAssignmentUserModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InternalAssignmentUserModalComponent]
    });
    fixture = TestBed.createComponent(InternalAssignmentUserModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DelegateUserModalComponent } from './delegate-user-modal.component';

describe('DelegateUserModalComponent', () => {
  let component: DelegateUserModalComponent;
  let fixture: ComponentFixture<DelegateUserModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DelegateUserModalComponent]
    });
    fixture = TestBed.createComponent(DelegateUserModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

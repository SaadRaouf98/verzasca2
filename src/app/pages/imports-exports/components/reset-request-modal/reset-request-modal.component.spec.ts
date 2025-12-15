import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetRequestModalComponent } from './reset-request-modal.component';

describe('ResetRequestComponent', () => {
  let component: ResetRequestModalComponent;
  let fixture: ComponentFixture<ResetRequestModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResetRequestModalComponent],
    });
    fixture = TestBed.createComponent(ResetRequestModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

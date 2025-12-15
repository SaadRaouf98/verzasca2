import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditingModalComponent } from './auditing-modal.component';

describe('AuditingModalComponent', () => {
  let component: AuditingModalComponent;
  let fixture: ComponentFixture<AuditingModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AuditingModalComponent],
    });
    fixture = TestBed.createComponent(AuditingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

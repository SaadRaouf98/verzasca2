import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateAccessibilityModalComponent } from './update-accessibility-modal.component';

describe('UpdateAccessibilityModalComponent', () => {
  let component: UpdateAccessibilityModalComponent;
  let fixture: ComponentFixture<UpdateAccessibilityModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateAccessibilityModalComponent]
    });
    fixture = TestBed.createComponent(UpdateAccessibilityModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

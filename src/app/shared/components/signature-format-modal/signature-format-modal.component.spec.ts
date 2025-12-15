import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignatureFormatModalComponent } from './signature-format-modal.component';

describe('SignatureFormatModalComponent', () => {
  let component: SignatureFormatModalComponent;
  let fixture: ComponentFixture<SignatureFormatModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SignatureFormatModalComponent]
    });
    fixture = TestBed.createComponent(SignatureFormatModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

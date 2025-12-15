import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignaturePlaceHolderComponent } from './signature-place-holder.component';

describe('SignaturePlaceHolderComponent', () => {
  let component: SignaturePlaceHolderComponent;
  let fixture: ComponentFixture<SignaturePlaceHolderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SignaturePlaceHolderComponent]
    });
    fixture = TestBed.createComponent(SignaturePlaceHolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

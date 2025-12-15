import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectBenefitTypeModalComponent } from './select-benefit-type-modal.component';

describe('SelectBenefitTypeModalComponent', () => {
  let component: SelectBenefitTypeModalComponent;
  let fixture: ComponentFixture<SelectBenefitTypeModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SelectBenefitTypeModalComponent]
    });
    fixture = TestBed.createComponent(SelectBenefitTypeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

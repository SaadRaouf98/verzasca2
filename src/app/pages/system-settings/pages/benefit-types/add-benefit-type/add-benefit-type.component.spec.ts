import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBenefitTypePage } from './add-benefit-type.component';

describe('AddBenefitTypePage', () => {
  let component: AddBenefitTypePage;
  let fixture: ComponentFixture<AddBenefitTypePage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddBenefitTypePage],
    });
    fixture = TestBed.createComponent(AddBenefitTypePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BenefitTypesListComponent } from './benefit-types-list.component';

describe('BenefitTypesListComponent', () => {
  let component: BenefitTypesListComponent;
  let fixture: ComponentFixture<BenefitTypesListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BenefitTypesListComponent]
    });
    fixture = TestBed.createComponent(BenefitTypesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

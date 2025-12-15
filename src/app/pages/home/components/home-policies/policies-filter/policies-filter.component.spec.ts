import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliciesFilterComponent } from './policies-filter.component';

describe('PoliciesFilterComponent', () => {
  let component: PoliciesFilterComponent;
  let fixture: ComponentFixture<PoliciesFilterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PoliciesFilterComponent]
    });
    fixture = TestBed.createComponent(PoliciesFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

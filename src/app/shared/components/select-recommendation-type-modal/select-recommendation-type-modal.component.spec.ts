import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectRecommendationTypeModalComponent } from './select-recommendation-type-modal.component';

describe('SelectRecommendationTypeModalComponent', () => {
  let component: SelectRecommendationTypeModalComponent;
  let fixture: ComponentFixture<SelectRecommendationTypeModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SelectRecommendationTypeModalComponent]
    });
    fixture = TestBed.createComponent(SelectRecommendationTypeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

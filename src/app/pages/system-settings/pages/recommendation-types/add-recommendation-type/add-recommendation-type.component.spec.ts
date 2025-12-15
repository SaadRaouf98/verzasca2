import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRecommendationTypeComponent } from './add-recommendation-type.component';

describe('AddRecommendationTypeComponent', () => {
  let component: AddRecommendationTypeComponent;
  let fixture: ComponentFixture<AddRecommendationTypeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddRecommendationTypeComponent]
    });
    fixture = TestBed.createComponent(AddRecommendationTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

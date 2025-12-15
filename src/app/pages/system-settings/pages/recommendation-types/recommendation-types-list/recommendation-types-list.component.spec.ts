import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecommendationTypesListComponent } from './recommendation-types-list.component';

describe('RecommendationTypesListComponent', () => {
  let component: RecommendationTypesListComponent;
  let fixture: ComponentFixture<RecommendationTypesListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RecommendationTypesListComponent]
    });
    fixture = TestBed.createComponent(RecommendationTypesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

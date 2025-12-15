import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepCategoriesListPage } from './step-categories-list.component';

describe('StepCategoriesListComponent', () => {
  let component: StepCategoriesListPage;
  let fixture: ComponentFixture<StepCategoriesListPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StepCategoriesListPage],
    });
    fixture = TestBed.createComponent(StepCategoriesListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

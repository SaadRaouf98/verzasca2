import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportsFiltersComponent } from './exports-filters.component';

describe('ImportsExportsFiltersComponent', () => {
  let component: ExportsFiltersComponent;
  let fixture: ComponentFixture<ExportsFiltersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExportsFiltersComponent]
    });
    fixture = TestBed.createComponent(ExportsFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

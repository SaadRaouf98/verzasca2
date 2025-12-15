import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportsExportsFiltersComponent } from './imports-exports-filters.component';

describe('ImportsExportsFiltersComponent', () => {
  let component: ImportsExportsFiltersComponent;
  let fixture: ComponentFixture<ImportsExportsFiltersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImportsExportsFiltersComponent]
    });
    fixture = TestBed.createComponent(ImportsExportsFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

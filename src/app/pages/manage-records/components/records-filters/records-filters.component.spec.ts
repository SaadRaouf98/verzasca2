import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordsFiltersComponent } from './records-filters.component';

describe('RecordsFiltersComponent', () => {
  let component: RecordsFiltersComponent;
  let fixture: ComponentFixture<RecordsFiltersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RecordsFiltersComponent]
    });
    fixture = TestBed.createComponent(RecordsFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

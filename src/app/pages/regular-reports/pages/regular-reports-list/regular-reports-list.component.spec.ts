import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegularReportsListComponent } from './regular-reports-list.component';

describe('RegularReportsListComponent', () => {
  let component: RegularReportsListComponent;
  let fixture: ComponentFixture<RegularReportsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegularReportsListComponent]
    });
    fixture = TestBed.createComponent(RegularReportsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

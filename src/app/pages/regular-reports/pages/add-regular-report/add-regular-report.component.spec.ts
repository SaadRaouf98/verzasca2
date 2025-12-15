import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRegularReportComponent } from './add-regular-report.component';

describe('AddRegularReportComponent', () => {
  let component: AddRegularReportComponent;
  let fixture: ComponentFixture<AddRegularReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddRegularReportComponent]
    });
    fixture = TestBed.createComponent(AddRegularReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

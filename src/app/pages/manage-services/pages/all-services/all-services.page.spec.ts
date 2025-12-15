import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllServicesPage } from './all-services.page';

describe('AllServicesComponent', () => {
  let component: AllServicesPage;
  let fixture: ComponentFixture<AllServicesPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllServicesPage],
    });
    fixture = TestBed.createComponent(AllServicesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePoliciesComponent } from './home-policies.component';

describe('HomePoliciesComponent', () => {
  let component: HomePoliciesComponent;
  let fixture: ComponentFixture<HomePoliciesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HomePoliciesComponent]
    });
    fixture = TestBed.createComponent(HomePoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

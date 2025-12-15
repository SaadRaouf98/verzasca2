import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepsListComponent } from './steps-list.component';

describe('StepsListComponent', () => {
  let component: StepsListComponent;
  let fixture: ComponentFixture<StepsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StepsListComponent]
    });
    fixture = TestBed.createComponent(StepsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

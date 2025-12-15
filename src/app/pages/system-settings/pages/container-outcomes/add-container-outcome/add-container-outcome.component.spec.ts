import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddContainerOutcomeComponent } from './add-container-outcome.component';

describe('AddContainerOutcomeComponent', () => {
  let component: AddContainerOutcomeComponent;
  let fixture: ComponentFixture<AddContainerOutcomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddContainerOutcomeComponent]
    });
    fixture = TestBed.createComponent(AddContainerOutcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProcessTypeJustificationsComponent } from './add-process-type-justifications.component';

describe('AddProcessTypeJustificationsComponent', () => {
  let component: AddProcessTypeJustificationsComponent;
  let fixture: ComponentFixture<AddProcessTypeJustificationsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddProcessTypeJustificationsComponent]
    });
    fixture = TestBed.createComponent(AddProcessTypeJustificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

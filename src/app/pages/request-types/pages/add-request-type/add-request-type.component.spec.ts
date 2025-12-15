import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRequestTypeComponent } from './add-request-type.component';

describe('AddRequestTypeComponent', () => {
  let component: AddRequestTypeComponent;
  let fixture: ComponentFixture<AddRequestTypeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddRequestTypeComponent]
    });
    fixture = TestBed.createComponent(AddRequestTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

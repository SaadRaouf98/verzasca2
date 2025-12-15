import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPriorityPage } from './add-priority.component';

describe('AddPriorityPage', () => {
  let component: AddPriorityPage;
  let fixture: ComponentFixture<AddPriorityPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddPriorityPage],
    });
    fixture = TestBed.createComponent(AddPriorityPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

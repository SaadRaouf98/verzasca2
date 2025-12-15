import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectActionsModalComponent } from './select-actions-modal.component';

describe('SelectActionsModalComponent', () => {
  let component: SelectActionsModalComponent;
  let fixture: ComponentFixture<SelectActionsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SelectActionsModalComponent]
    });
    fixture = TestBed.createComponent(SelectActionsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

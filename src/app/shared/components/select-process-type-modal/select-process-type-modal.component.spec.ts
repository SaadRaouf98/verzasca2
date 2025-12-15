import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectProcessTypeModalComponent } from './select-process-type-modal.component';

describe('SelectProcessTypeModalComponent', () => {
  let component: SelectProcessTypeModalComponent;
  let fixture: ComponentFixture<SelectProcessTypeModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SelectProcessTypeModalComponent]
    });
    fixture = TestBed.createComponent(SelectProcessTypeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

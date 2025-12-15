import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAmountsModalComponent } from './edit-amounts-modal.component';

describe('EditAmountsModalComponent', () => {
  let component: EditAmountsModalComponent;
  let fixture: ComponentFixture<EditAmountsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditAmountsModalComponent]
    });
    fixture = TestBed.createComponent(EditAmountsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

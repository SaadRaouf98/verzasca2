import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TakeActionModalComponent } from './take-action-modal.component';

describe('TakeActionModalComponent', () => {
  let component: TakeActionModalComponent;
  let fixture: ComponentFixture<TakeActionModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TakeActionModalComponent]
    });
    fixture = TestBed.createComponent(TakeActionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitiateModalComponent } from './initiate-modal.component';

describe('InitiateModalComponent', () => {
  let component: InitiateModalComponent;
  let fixture: ComponentFixture<InitiateModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InitiateModalComponent]
    });
    fixture = TestBed.createComponent(InitiateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

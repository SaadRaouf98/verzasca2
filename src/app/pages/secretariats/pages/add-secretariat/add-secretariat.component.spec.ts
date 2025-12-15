import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSecretariatComponent } from './add-secretariat.component';

describe('AddSecretarialComponent', () => {
  let component: AddSecretariatComponent;
  let fixture: ComponentFixture<AddSecretariatComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddSecretariatComponent],
    });
    fixture = TestBed.createComponent(AddSecretariatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

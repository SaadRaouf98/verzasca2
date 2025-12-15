import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFoundationPage } from './add-foundation.component';

describe('AddFoundationPage', () => {
  let component: AddFoundationPage;
  let fixture: ComponentFixture<AddFoundationPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddFoundationPage],
    });
    fixture = TestBed.createComponent(AddFoundationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

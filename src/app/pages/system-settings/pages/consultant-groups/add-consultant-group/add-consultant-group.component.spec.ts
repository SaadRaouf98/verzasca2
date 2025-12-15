import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddConsultantGroupComponent } from './add-consultant-group.component';

describe('AddConsultantGroupComponent', () => {
  let component: AddConsultantGroupComponent;
  let fixture: ComponentFixture<AddConsultantGroupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddConsultantGroupComponent]
    });
    fixture = TestBed.createComponent(AddConsultantGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCommitteeSignaturesComponent } from './add-committee-signatures.component';

describe('AddCommitteeSignaturesComponent', () => {
  let component: AddCommitteeSignaturesComponent;
  let fixture: ComponentFixture<AddCommitteeSignaturesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddCommitteeSignaturesComponent]
    });
    fixture = TestBed.createComponent(AddCommitteeSignaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
